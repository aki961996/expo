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


# ─────────────────────────────────────────────────────────────
# API 1: Send OTP
# POST /api/method/expo_management.expo_management.auth.send_otp
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def send_otp(mobile):
    """
    Send OTP to mobile number.
    Returns: { exists: bool, message: str }
    """
    mobile = (mobile or "").strip()

    # Validate mobile
    if not mobile or len(mobile) < 10:
        frappe.throw(_("Invalid mobile number"), frappe.ValidationError)

    # Normalize — ensure +91 prefix
    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")

    # Check if exhibitor exists
    exists = frappe.db.exists(
        "Exhibitor Profile",
        {"contact_number": mobile}
    )

    # Check if pending approval
    if exists:
        status = frappe.db.get_value("Exhibitor Profile", {"contact_number": mobile}, "status")
        if status == "Pending Approval":
            return {
                "success": False,
                "error": "pending_approval",
                "message": "Your registration is pending admin approval."
            }
        if status == "Blacklisted":
            return {
                "success": False,
                "error": "blacklisted",
                "message": "Your account has been suspended. Contact support."
            }

    # Generate OTP
    otp = _generate_otp()

    # Store in Frappe cache (Redis) with expiry
    cache_key = _get_otp_cache_key(mobile)
    frappe.cache().set_value(cache_key, otp, expires_in_sec=OTP_EXPIRY_MINUTES * 60)

    # TODO: Integrate SMS gateway (MSG91 / Twilio)
    # For now — log to console (development)
    frappe.logger().info(f"[EXPO OTP] Mobile: {mobile} | OTP: {otp}")
    print(f"\n{'='*40}")
    print(f"📱 OTP for {mobile}: {otp}")
    print(f"{'='*40}\n")

    return {
        "success": True,
        "exists": bool(exists),
        "message": f"OTP sent to {mobile[-4:].rjust(len(mobile), '*')}",
        # Remove in production — only for development!
        "dev_otp": otp
    }


# ─────────────────────────────────────────────────────────────
# API 2: Verify OTP
# POST /api/method/expo_management.expo_management.auth.verify_otp
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def verify_otp(mobile, otp):
    """
    Verify OTP and login exhibitor.
    Returns: { success: bool, user: dict }
    """
    mobile = (mobile or "").strip()
    otp    = (otp or "").strip()

    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")

    # Get stored OTP
    cache_key  = _get_otp_cache_key(mobile)
    stored_otp = frappe.cache().get_value(cache_key)

    if not stored_otp:
        return {"success": False, "error": "otp_expired", "message": "OTP expired. Request a new one."}

    if stored_otp != otp:
        return {"success": False, "error": "otp_invalid", "message": "Invalid OTP. Please try again."}

    # Clear OTP after successful verify
    frappe.cache().delete_value(cache_key)

    # Get exhibitor profile
    exhibitor_name = frappe.db.get_value(
        "Exhibitor Profile",
        {"contact_number": mobile},
        "name"
    )

    if not exhibitor_name:
        return {"success": False, "error": "not_found", "message": "Exhibitor not found."}

    exhibitor = frappe.get_doc("Exhibitor Profile", exhibitor_name)

    # Get or create Frappe User for this exhibitor
    user_email = exhibitor.email or f"exhibitor_{exhibitor_name.lower().replace(' ', '_')}@expo.local"

    if not frappe.db.exists("User", user_email):
        user = frappe.get_doc({
            "doctype": "User",
            "email": user_email,
            "first_name": exhibitor.exhibitor_name or exhibitor.company_name,
            "mobile_no": mobile,
            "user_type": "Website User",
            "roles": [{"role": "Expo Exhibitor"}],
            "send_welcome_email": 0,
        })
        user.insert(ignore_permissions=True)
        frappe.db.commit()

        # Link user to exhibitor
        frappe.db.set_value("Exhibitor Profile", exhibitor_name, "frappe_user", user_email)
    else:
        user = frappe.get_doc("User", user_email)

    # Login the user (create session)
    frappe.local.login_manager.login_as(user_email)

    return {
        "success": True,
        "message": "Login successful",
        "exhibitor": {
            "name": exhibitor.name,
            "exhibitor_name": exhibitor.exhibitor_name,
            "company_name": exhibitor.company_name,
            "email": exhibitor.email,
            "mobile": mobile,
            "status": exhibitor.status,
            "industry": exhibitor.industry,
            "logo": exhibitor.company_logo,
        }
    }


# ─────────────────────────────────────────────────────────────
# API 3: Register new Exhibitor
# POST /api/method/expo_management.expo_management.auth.register_exhibitor
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
):
    """
    Register new exhibitor — status = Pending Approval.
    Admin must approve before they can login.
    """
    mobile = (mobile or "").strip()
    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")

    # Check duplicates
    if frappe.db.exists("Exhibitor Profile", {"contact_number": mobile}):
        return {"success": False, "error": "mobile_exists", "message": "This mobile number is already registered."}

    if frappe.db.exists("Exhibitor Profile", {"email": email}):
        return {"success": False, "error": "email_exists", "message": "This email is already registered."}

    # Create exhibitor with Pending Approval
    doc = frappe.get_doc({
        "doctype": "Exhibitor Profile",
        "exhibitor_name": exhibitor_name,
        "company_name": company_name,
        "contact_number": mobile,
        "email": email,
        "industry": industry,
        "gst_number": gst_number,
        "annual_turnover": annual_turnover,
        "website": website,
        "address": address,
        "product_categories": product_categories,
        "description": description,
        "status": "Pending Approval",
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    # Notify admin (optional — send email)
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
        pass  # Email optional — don't block registration

    return {
        "success": True,
        "message": "Registration submitted! You'll be notified once approved.",
        "exhibitor_id": doc.name,
    }


# ─────────────────────────────────────────────────────────────
# API 4: Get current logged-in Exhibitor
# GET /api/method/expo_management.expo_management.auth.get_current_exhibitor
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def get_current_exhibitor():
    """
    Returns current logged-in exhibitor profile.
    """
    user = frappe.session.user
    if user == "Guest":
        frappe.throw(_("Not logged in"), frappe.AuthenticationError)

    exhibitor_name = frappe.db.get_value(
        "Exhibitor Profile",
        {"frappe_user": user},
        "name"
    )

    if not exhibitor_name:
        frappe.throw(_("Exhibitor profile not found"), frappe.DoesNotExistError)

    exhibitor = frappe.get_doc("Exhibitor Profile", exhibitor_name)

    return {
        "name": exhibitor.name,
        "exhibitor_name": exhibitor.exhibitor_name,
        "company_name": exhibitor.company_name,
        "email": exhibitor.email,
        "mobile": exhibitor.contact_number,
        "status": exhibitor.status,
        "industry": exhibitor.industry,
        "logo": exhibitor.company_logo,
    }


# ─────────────────────────────────────────────────────────────
# API 5: Logout
# POST /api/method/expo_management.expo_management.auth.logout
# ─────────────────────────────────────────────────────────────
@frappe.whitelist(allow_guest=True)
def logout():
    frappe.local.login_manager.logout()
    return {"success": True, "message": "Logged out successfully"}
