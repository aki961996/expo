import frappe
import random
import string
from frappe import _
from frappe.utils import now_datetime, add_to_date


# ── OTP Config ────────────────────────────────────────────────
OTP_EXPIRY_MINUTES = 10
OTP_LENGTH = 6


def _generate_otp():
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


def _get_otp_cache_key(mobile):
    return f"expo_otp:{mobile}"


def _normalize_mobile(mobile):
    mobile = (mobile or "").strip()
    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")
    return mobile


# ─────────────────────────────────────────────────────────────
# API 1: Send OTP
# POST /api/method/expo_management.expo_management.auth.send_otp
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def send_otp(mobile, user_type="exhibitor"):
    """
    Send OTP to mobile number.
    user_type: 'exhibitor' | 'visitor'
    """
    mobile = _normalize_mobile(mobile)

    if not mobile or len(mobile) < 10:
        frappe.throw(_("Invalid mobile number"), frappe.ValidationError)

    if user_type == "visitor":
        # ── Visitor lookup ────────────────────────────────────
        exists = frappe.db.exists("Visitor Profile", {"mobile": mobile})
        if not exists:
            return {
                "success": False,
                "error":   "not_found",
                "message": "No visitor account found. Please register first.",
            }
        v_status = frappe.db.get_value("Visitor Profile", {"mobile": mobile}, "status")
        if v_status == "Inactive":
            return {
                "success": False,
                "error":   "blacklisted",
                "message": "Your account is inactive. Contact support.",
            }

    else:
        # ── Exhibitor lookup ──────────────────────────────────
        exists = frappe.db.exists("Exhibitor Profile", {"contact_number": mobile})
        if exists:
            status = frappe.db.get_value("Exhibitor Profile", {"contact_number": mobile}, "status")
            if status == "Pending Approval":
                return {
                    "success": False,
                    "error":   "pending_approval",
                    "message": "Your registration is pending admin approval.",
                }
            if status == "Blacklisted":
                return {
                    "success": False,
                    "error":   "blacklisted",
                    "message": "Your account has been suspended. Contact support.",
                }

    # Generate & store OTP
    otp       = _generate_otp()
    cache_key = _get_otp_cache_key(mobile)
    frappe.cache().set_value(cache_key, otp, expires_in_sec=OTP_EXPIRY_MINUTES * 60)

    # TODO: Integrate SMS gateway (MSG91 / Twilio)
    frappe.logger().info(f"[EXPO OTP] Mobile: {mobile} | Type: {user_type} | OTP: {otp}")
    print(f"\n{'='*40}")
    print(f"📱 OTP for {mobile} ({user_type}): {otp}")
    print(f"{'='*40}\n")

    return {
        "success":   True,
        "exists":    bool(exists),
        "user_type": user_type,
        "message":   f"OTP sent to {mobile[-4:].rjust(len(mobile), '*')}",
        "dev_otp":   otp,   # Remove in production!
    }


# ─────────────────────────────────────────────────────────────
# API 2: Verify OTP
# POST /api/method/expo_management.expo_management.auth.verify_otp
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def verify_otp(mobile, otp, user_type="exhibitor"):
    """
    Verify OTP and login exhibitor or visitor.
    user_type: 'exhibitor' | 'visitor'
    """
    mobile = _normalize_mobile(mobile)
    otp    = (otp or "").strip()

    # Validate OTP
    cache_key  = _get_otp_cache_key(mobile)
    stored_otp = frappe.cache().get_value(cache_key)

    if not stored_otp:
        return {"success": False, "error": "otp_expired",  "message": "OTP expired. Request a new one."}
    if stored_otp != otp:
        return {"success": False, "error": "otp_invalid",  "message": "Invalid OTP. Please try again."}

    # Clear OTP after successful verify
    frappe.cache().delete_value(cache_key)

    if user_type == "visitor":
        return _login_visitor(mobile)
    else:
        return _login_exhibitor(mobile)


def _login_exhibitor(mobile):
    exhibitor_name = frappe.db.get_value(
        "Exhibitor Profile", {"contact_number": mobile}, "name"
    )
    if not exhibitor_name:
        return {"success": False, "error": "not_found", "message": "Exhibitor not found."}

    exhibitor  = frappe.get_doc("Exhibitor Profile", exhibitor_name)
    user_email = exhibitor.email or f"exhibitor_{exhibitor_name.lower().replace(' ', '_')}@expo.local"

    _get_or_create_frappe_user(
        email=user_email,
        full_name=exhibitor.exhibitor_name or exhibitor.company_name,
        mobile=mobile,
        role="Expo Exhibitor",
    )

    frappe.db.set_value("Exhibitor Profile", exhibitor_name, "frappe_user", user_email)
    frappe.local.login_manager.login_as(user_email)
    frappe.db.commit()

    return {
        "success":    True,
        "user_type":  "exhibitor",
        "message":    "Login successful",
        "exhibitor": {
            "name":           exhibitor.name,
            "exhibitor_name": exhibitor.exhibitor_name,
            "company_name":   exhibitor.company_name,
            "email":          exhibitor.email,
            "mobile":         mobile,
            "status":         exhibitor.status,
            "industry":       exhibitor.industry,
            "logo":           exhibitor.company_logo,
        },
    }


def _login_visitor(mobile):
    visitor_name = frappe.db.get_value(
        "Visitor Profile", {"mobile": mobile}, "name"
    )
    if not visitor_name:
        return {"success": False, "error": "not_found", "message": "Visitor profile not found."}

    visitor    = frappe.get_doc("Visitor Profile", visitor_name)
    user_email = visitor.email or f"visitor_{mobile.replace('+', '')}@expo.local"

    _get_or_create_frappe_user(
        email=user_email,
        full_name=visitor.visitor_name,
        mobile=mobile,
        role="Visitor",
    )

    frappe.db.set_value("Visitor Profile", visitor_name, "frappe_user", user_email)
    frappe.local.login_manager.login_as(user_email)
    frappe.db.commit()

    return {
        "success":   True,
        "user_type": "visitor",
        "message":   "Login successful",
        "visitor": {
            "name":         visitor.name,
            "visitor_name": visitor.visitor_name,
            "company_name": visitor.company_name or "",
            "email":        visitor.email or "",
            "mobile":       mobile,
            "status":       visitor.status,
            "industry":     visitor.industry or "",
        },
    }


def _get_or_create_frappe_user(email, full_name, mobile, role="Visitor"):
    if frappe.db.exists("User", email):
        return email
    user = frappe.get_doc({
        "doctype":            "User",
        "email":              email,
        "first_name":         full_name,
        "mobile_no":          mobile,
        "user_type":          "Website User",
        "send_welcome_email": 0,
    })
    user.insert(ignore_permissions=True)
    user.add_roles(role)
    frappe.db.commit()
    return email


# ─────────────────────────────────────────────────────────────
# API 3: Register new Exhibitor
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def register_exhibitor(
    exhibitor_name,
    company_name,
    mobile,
    email,
    industry=None,
    gst_number=None,
    annual_turnover=None,
    website=None,
    address=None,
    product_categories=None,
    description=None,
    contact_person=None,
):
    mobile = _normalize_mobile(mobile)

    if frappe.db.exists("Exhibitor Profile", {"contact_number": mobile}):
        return {"success": False, "error": "mobile_exists", "message": "This mobile number is already registered."}
    if frappe.db.exists("Exhibitor Profile", {"email": email}):
        return {"success": False, "error": "email_exists",  "message": "This email is already registered."}

    doc = frappe.get_doc({
        "doctype":               "Exhibitor Profile",
        "exhibitor_name":        exhibitor_name,
        "company_name":          company_name,
        "contact_person":        contact_person or exhibitor_name,
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
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    # Notify admin
    try:
        admin_email = frappe.db.get_single_value("System Settings", "email_footer_address") or "admin@expo.local"
        frappe.sendmail(
            recipients=[admin_email],
            subject=f"New Exhibitor Registration: {company_name}",
            message=f"""
                <p>New exhibitor registration received:</p>
                <ul>
                    <li><b>Name:</b> {exhibitor_name}</li>
                    <li><b>Company:</b> {company_name}</li>
                    <li><b>Mobile:</b> {mobile}</li>
                    <li><b>Email:</b> {email}</li>
                    <li><b>Industry:</b> {industry}</li>
                </ul>
                <p>Please review and approve in the Expo Management admin panel.</p>
            """,
            now=True,
        )
    except Exception:
        pass

    return {
        "success":      True,
        "message":      "Registration submitted! You'll be notified once approved.",
        "exhibitor_id": doc.name,
    }


# ─────────────────────────────────────────────────────────────
# API 4: Register new Visitor (auto-approved)
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def register_visitor(
    visitor_name,
    mobile,
    email=None,
    company_name=None,
    industry=None,
    designation=None,
    city=None,
    interests=None,
    purpose_of_visit=None,
):
    mobile = _normalize_mobile(mobile)

    if frappe.db.exists("Visitor Profile", {"mobile": mobile}):
        return {"success": False, "error": "mobile_exists", "message": "This mobile number is already registered."}

    doc = frappe.get_doc({
        "doctype":          "Visitor Profile",
        "visitor_name":     visitor_name,
        "mobile":           mobile,
        "email":            email or "",
        "company_name":     company_name or "",
        "industry":         industry or "",
        "designation":      designation or "",
        "city":             city or "",
        "interests":        interests or "",
        "purpose_of_visit": purpose_of_visit or "",
        "status":           "Active",   # visitors auto-approved
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    return {
        "success":    True,
        "message":    "Registration successful! You can now login.",
        "visitor_id": doc.name,
    }


# ─────────────────────────────────────────────────────────────
# API 5: Get current logged-in user (exhibitor or visitor)
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def get_current_user():
    user = frappe.session.user
    if not user or user == "Guest":
        return {"logged_in": False}

    # Check exhibitor first
    ex_name = frappe.db.get_value("Exhibitor Profile", {"frappe_user": user}, "name")
    if ex_name:
        ex = frappe.get_doc("Exhibitor Profile", ex_name)
        if ex.status == "Active":
            return {
                "logged_in": True,
                "user_type": "exhibitor",
                "exhibitor": {
                    "name":           ex.name,
                    "exhibitor_name": ex.exhibitor_name,
                    "company_name":   ex.company_name,
                    "email":          ex.email,
                    "mobile":         ex.contact_number,
                    "status":         ex.status,
                    "industry":       ex.industry,
                    "logo":           ex.company_logo,
                },
            }
        return {"logged_in": False, "error": "inactive"}

    # Check visitor
    v_name = frappe.db.get_value("Visitor Profile", {"frappe_user": user}, "name")
    if v_name:
        v = frappe.get_doc("Visitor Profile", v_name)
        if v.status == "Active":
            return {
                "logged_in": True,
                "user_type": "visitor",
                "visitor": {
                    "name":         v.name,
                    "visitor_name": v.visitor_name,
                    "company_name": v.company_name or "",
                    "email":        v.email or "",
                    "mobile":       v.mobile,
                    "status":       v.status,
                    "industry":     v.industry or "",
                },
            }
        return {"logged_in": False, "error": "inactive"}

    return {"logged_in": False}


# Backward compat — old API still works
@frappe.whitelist(allow_guest=True)
def get_current_exhibitor():
    result = get_current_user()
    if result.get("logged_in") and result.get("user_type") == "exhibitor":
        return {"logged_in": True, "exhibitor": result["exhibitor"]}
    return {"logged_in": False}


# ─────────────────────────────────────────────────────────────
# API 6: Logout
# ─────────────────────────────────────────────────────────────
@frappe.whitelist()
def logout():
    frappe.local.login_manager.logout()
    return {"success": True, "message": "Logged out successfully"}