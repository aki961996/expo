import frappe
import random
import string
from frappe import _


# ── OTP Config ────────────────────────────────────────────────
OTP_EXPIRY_MINUTES = 10
OTP_LENGTH = 6


def _generate_otp():
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


def _get_otp_cache_key(mobile):
    return f"expo_otp:{mobile}"


# ─────────────────────────────────────────────────────────────
# API 1: Send OTP
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def send_otp(mobile):
    mobile = (mobile or "").strip()

    if not mobile or len(mobile) < 10:
        frappe.throw(_("Invalid mobile number"), frappe.ValidationError)

    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")

    exists = frappe.db.exists("Exhibitor Profile", {"contact_number": mobile})

    if exists:
        status = frappe.db.get_value("Exhibitor Profile", {"contact_number": mobile}, "status")
        if status == "Pending Approval":
            return {"success": False, "error": "pending_approval", "message": "Your registration is pending admin approval."}
        if status == "Blacklisted":
            return {"success": False, "error": "blacklisted", "message": "Your account has been suspended. Contact support."}

    otp       = _generate_otp()
    cache_key = _get_otp_cache_key(mobile)
    frappe.cache().set_value(cache_key, otp, expires_in_sec=OTP_EXPIRY_MINUTES * 60)

    frappe.logger().info(f"[EXPO OTP] Mobile: {mobile} | OTP: {otp}")
    print(f"\n{'='*40}\n📱 OTP for {mobile}: {otp}\n{'='*40}\n")

    # ── Send SMS via Fast2SMS ─────────────────────────────
    sms_sent = False
    sms_error = None
    try:
        api_key = frappe.conf.get("fast2sms_api_key")
        if api_key:
            import requests as _req
            number = mobile.replace("+91", "").replace("+", "").strip()
            resp = _req.post(
                "https://www.fast2sms.com/dev/bulkV2",
                headers={"authorization": api_key},
                data={
                    "route":   "q",
                    "message": f"Your Expo Management OTP is {otp}. Valid for {OTP_EXPIRY_MINUTES} minutes. Do not share.",
                    "numbers": number,
                },
                timeout=10,
            )
            result = resp.json()
            if result.get("return") is True:
                sms_sent = True
            else:
                sms_error = result.get("message", "SMS failed")
                frappe.logger().warning(f"[EXPO OTP] Fast2SMS error: {sms_error}")
        else:
            frappe.logger().warning("[EXPO OTP] fast2sms_api_key not configured")
    except Exception as e:
        sms_error = str(e)
        frappe.logger().error(f"[EXPO OTP] SMS send exception: {e}")

    response = {
        "success": True,
        "exists":  bool(exists),
        "message": f"OTP sent to {mobile[-4:].rjust(len(mobile), '*')}",
    }

    # dev_otp only when SMS not sent (dev/testing fallback)
    if not sms_sent:
        response["dev_otp"] = otp
        response["sms_error"] = sms_error

    return response


# ─────────────────────────────────────────────────────────────
# API 2: Verify OTP
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def verify_otp(mobile, otp):
    mobile = (mobile or "").strip()
    otp    = (otp or "").strip()

    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")

    cache_key  = _get_otp_cache_key(mobile)
    stored_otp = frappe.cache().get_value(cache_key)

    if not stored_otp:
        return {"success": False, "error": "otp_expired", "message": "OTP expired. Request a new one."}
    if stored_otp != otp:
        return {"success": False, "error": "otp_invalid", "message": "Invalid OTP. Please try again."}

    frappe.cache().delete_value(cache_key)

    exhibitor_name = frappe.db.get_value("Exhibitor Profile", {"contact_number": mobile}, "name")
    if not exhibitor_name:
        return {"success": False, "error": "not_found", "message": "Exhibitor not found."}

    exhibitor  = frappe.get_doc("Exhibitor Profile", exhibitor_name)
    user_email = exhibitor.email or f"exhibitor_{mobile.replace('+','').replace(' ','')}@expo.local"

    existing_by_mobile = frappe.db.get_value("User", {"mobile_no": mobile}, "name")
    if existing_by_mobile and existing_by_mobile != user_email:
        user_email = existing_by_mobile

    if not frappe.db.exists("User", user_email):
        user = frappe.get_doc({
            "doctype":            "User",
            "email":              user_email,
            "first_name":         exhibitor.exhibitor_name or exhibitor.company_name,
            "mobile_no":          mobile,
            "user_type":          "Website User",
            "roles":              [{"role": "Expo Exhibitor"}],
            "send_welcome_email": 0,
        })
        user.insert(ignore_permissions=True)
        frappe.db.commit()
    else:
        if not frappe.db.get_value("User", user_email, "mobile_no"):
            frappe.db.set_value("User", user_email, "mobile_no", mobile)
            frappe.db.commit()

    if exhibitor.frappe_user != user_email:
        frappe.db.set_value("Exhibitor Profile", exhibitor_name, "frappe_user", user_email)
        frappe.db.commit()

    frappe.local.login_manager.login_as(user_email)

    return {
        "success": True,
        "message": "Login successful",
        "exhibitor": {
            "name":               exhibitor.name,
            "exhibitor_name":     exhibitor.exhibitor_name,
            "company_name":       exhibitor.company_name,
            "email":              exhibitor.email,
            "mobile":             mobile,
            "status":             exhibitor.status,
            "industry":           exhibitor.industry,
            "logo":               exhibitor.company_logo,
            "gst_number":         exhibitor.gst_number,
            "annual_turnover":    exhibitor.annual_turnover,
            "website":            exhibitor.website,
            "product_categories": exhibitor.product_categories,
            "description":        exhibitor.description,
        }
    }


# ─────────────────────────────────────────────────────────────
# API 3: Register new Exhibitor
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def register_exhibitor(
    exhibitor_name, company_name, mobile, email,
    industry=None, gst_number=None, annual_turnover=None,
    website=None, address=None, product_categories=None, description=None,
    has_digital_booth=0,
    booth_tagline=None, booth_description=None, booth_products=None,
    booth_website=None, booth_video_url=None,
    booth_contact_email=None, booth_contact_phone=None,
):
    mobile = (mobile or "").strip()
    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")

    if frappe.db.exists("Exhibitor Profile", {"contact_number": mobile}):
        return {"success": False, "error": "mobile_exists", "message": "This mobile number is already registered."}
    if frappe.db.exists("Exhibitor Profile", {"email": email}):
        return {"success": False, "error": "email_exists", "message": "This email is already registered."}

    doc = frappe.get_doc({
        "doctype":               "Exhibitor Profile",
        "exhibitor_name":        exhibitor_name,
        "company_name":          company_name,
        "contact_number":        mobile,
        "email":                 email,
        "industry":              industry,
        "gst_number":            gst_number,
        "annual_turnover":       annual_turnover,
        "website":               website,
        "communication_address": address,
        "product_categories":    product_categories,
        "description":           description,
        "status":                "Pending Approval",
        "has_digital_booth":     int(has_digital_booth or 0),
        "booth_tagline":         booth_tagline,
        "booth_description":     booth_description,
        "booth_products":        booth_products,
        "booth_website":         booth_website,
        "booth_video_url":       booth_video_url,
        "booth_contact_email":   booth_contact_email,
        "booth_contact_phone":   booth_contact_phone,
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    try:
        admin_email = frappe.db.get_single_value("System Settings", "email_footer_address") or "admin@expo.local"
        frappe.sendmail(
            recipients=[admin_email],
            subject=f"New Exhibitor Registration: {company_name}",
            message=f"<p>New registration: <b>{exhibitor_name}</b> ({company_name}) — {mobile} — {email}</p><p>Please approve in the admin panel.</p>",
            now=True,
        )
    except Exception:
        pass

    return {"success": True, "message": "Registration submitted! You'll be notified once approved.", "exhibitor_id": doc.name}


# ─────────────────────────────────────────────────────────────
# API 4: Get current logged-in Exhibitor
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def get_current_exhibitor():
    user = frappe.session.user

    if user == "Guest":
        return {"logged_in": False, "exhibitor": None}

    exhibitor_name = frappe.db.get_value("Exhibitor Profile", {"frappe_user": user}, "name")
    if not exhibitor_name:
        return {"logged_in": False, "exhibitor": None}

    exhibitor = frappe.get_doc("Exhibitor Profile", exhibitor_name)

    return {
        "logged_in": True,
        "exhibitor": {
            "name":               exhibitor.name,
            "exhibitor_name":     exhibitor.exhibitor_name,
            "company_name":       exhibitor.company_name,
            "email":              exhibitor.email,
            "mobile":             exhibitor.contact_number,
            "status":             exhibitor.status,
            "industry":           exhibitor.industry,
            "logo":               exhibitor.company_logo,
            # ── Profile fields ────────────────────────────────
            "gst_number":         exhibitor.gst_number,
            "annual_turnover":    exhibitor.annual_turnover,
            "website":            exhibitor.website,
            "product_categories": exhibitor.product_categories,
            "description":        exhibitor.description,
        }
    }


# ─────────────────────────────────────────────────────────────
# API 5: Logout
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def logout():
    frappe.local.login_manager.logout()
    return {"success": True, "message": "Logged out successfully"}


# ─────────────────────────────────────────────────────────────
# API 6: Update Profile
# ─────────────────────────────────────────────────────────────
@frappe.whitelist()
def update_profile(
    exhibitor_name=None, company_name=None,
    industry=None, gst_number=None, annual_turnover=None,
    website=None, product_categories=None, description=None,
):
    user = frappe.session.user
    if user == "Guest":
        frappe.throw(_("Not logged in"), frappe.AuthenticationError)

    exhibitor_doc_name = frappe.db.get_value(
        "Exhibitor Profile", {"frappe_user": user}, "name"
    )
    if not exhibitor_doc_name:
        frappe.throw(_("Exhibitor profile not found"), frappe.DoesNotExistError)

    updates = {}
    if exhibitor_name:          updates["exhibitor_name"]     = exhibitor_name
    if company_name:            updates["company_name"]       = company_name
    if industry:                updates["industry"]           = industry
    if gst_number:              updates["gst_number"]         = gst_number
    if annual_turnover:         updates["annual_turnover"]    = annual_turnover
    if website:                 updates["website"]            = website
    if product_categories:      updates["product_categories"] = product_categories
    if description is not None: updates["description"]        = description

    for field, value in updates.items():
        frappe.db.set_value("Exhibitor Profile", exhibitor_doc_name, field, value)

    frappe.db.commit()
    return {"success": True, "message": "Profile updated successfully"}