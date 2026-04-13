import frappe
import json
from frappe.model.document import Document
from frappe.utils import today, getdate, now


class ExpoEvent(Document):

	def validate(self):
		self._validate_dates()
		self._auto_set_status()

	def _validate_dates(self):
		if self.start_date and self.end_date:
			if getdate(self.start_date) > getdate(self.end_date):
				frappe.throw("End Date must be after Start Date")
		if self.setup_start_date and self.start_date:
			if getdate(self.setup_start_date) > getdate(self.start_date):
				frappe.throw("Setup Start Date must be before Event Start Date")

	def _auto_set_status(self):
		if self.status in ("Draft", "Cancelled"):
			return
		td    = getdate(today())
		start = getdate(self.start_date)
		end   = getdate(self.end_date)
		if td < start:
			self.status = "Upcoming"
		elif start <= td <= end:
			self.status = "Ongoing"
		else:
			self.status = "Completed"


# ─────────────────────────────────────────────────────────────
#  Helper
# ─────────────────────────────────────────────────────────────

def _get_existing_tables():
	return {
		"Expo Hall":            frappe.db.table_exists("Expo Hall"),
		"Expo Stall":           frappe.db.table_exists("Expo Stall"),
		"Expo Stall Dimension": frappe.db.table_exists("Expo Stall Dimension"),
		"Stall Booking":        frappe.db.table_exists("Stall Booking"),
		"Exhibitor Profile":    frappe.db.table_exists("Exhibitor Profile"),
		"Expo Service":         frappe.db.table_exists("Expo Service"),
		"CRM Lead":             frappe.db.table_exists("CRM Lead"),
		"Expo Facility":        frappe.db.table_exists("Expo Facility"),
	}


# ─────────────────────────────────────────────────────────────
#  API 1 — Event Listing Page
# ─────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=True)
def get_published_events(status=None, category=None, search=None, limit=20, offset=0):
	filters = {"is_published": 1}

	if status and status != "All":
		filters["status"] = status
	if category and category != "All":
		filters["category"] = category

	or_filters = None
	if search:
		or_filters = [
			["event_name",     "like", f"%{search}%"],
			["venue_name",     "like", f"%{search}%"],
			["city",           "like", f"%{search}%"],
			["organizer_name", "like", f"%{search}%"],
			["business_type",  "like", f"%{search}%"],
		]

	events = frappe.get_all(
		"Expo Event",
		filters=filters,
		or_filters=or_filters,
		fields=[
			"name", "event_name", "event_short_code",
			"category", "business_type", "organizer_name",
			"description", "logo", "banner",
			"start_date", "end_date", "setup_start_date", "dismantle_date",
			"venue_name", "city", "country",
			"status", "visitor_capacity", "exhibitor_capacity",
			"has_wifi", "has_ac", "has_food_court", "has_atm",
			"has_first_aid", "has_fire_safety", "has_security",
			"has_drinking_water", "has_prayer_room",
			"parking_cars", "parking_trucks",
			"washrooms_male", "washrooms_female", "washrooms_accessible",
		],
		order_by="start_date asc",
		limit=int(limit),
		start=int(offset),
	)

	t = _get_existing_tables()

	for ev in events:
		n = ev["name"]
		ev["hall_count"] = (
			frappe.db.count("Expo Hall", {"expo_event": n})
			if t["Expo Hall"] else 0
		)
		ev["total_stalls"] = (
			frappe.db.count("Expo Stall", {"expo_event": n})
			if t["Expo Stall"] else 0
		)
		ev["available_stalls"] = (
			frappe.db.count("Expo Stall", {"expo_event": n, "status": "Available"})
			if t["Expo Stall"] else 0
		)
		ev["exhibitor_count"] = (
			frappe.db.count("Stall Booking", {"expo_event": n, "docstatus": 1})
			if t["Stall Booking"] else 0
		)
		ev["service_count"] = (
			frappe.db.count("Expo Service", {"expo_event": n})
			if t["Expo Service"] else 0
		)

	total = frappe.db.count("Expo Event", filters)
	return {"events": events, "total": total}


# ─────────────────────────────────────────────────────────────
#  API 2 — Event Detail Page
# ─────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=True)
def get_event_detail(event_code):
	if not frappe.db.exists("Expo Event", event_code):
		frappe.throw(f"Event '{event_code}' not found", frappe.DoesNotExistError)

	event = frappe.get_doc("Expo Event", event_code)

	if not event.is_published:
		frappe.throw("This event is not published.", frappe.PermissionError)

	t = _get_existing_tables()

	# ── Halls + Dimensions ────────────────────────────────────
	halls = []
	if t["Expo Hall"]:
		halls = frappe.get_all(
			"Expo Hall",
			filters={"expo_event": event.name},
			fields=[
				"name", "hall_name", "hall_code", "hall_type",
				"area", "ceiling_height", "power_capacity",
				"price", "floor_plan",
			],
		)
		for hall in halls:
			hall["dimensions"] = (
				frappe.get_all(
					"Expo Stall Dimension",
					filters={"parent": hall["name"], "parenttype": "Expo Hall"},
					fields=[
						"dimension_label", "width", "depth", "area",
						"base_price", "corner_premium", "island_premium",
						"tax_percent", "deposit",
						"total_stalls", "available_stalls",
					],
				)
				if t["Expo Stall Dimension"] else []
			)
			hall["stall_summary"] = (
				{
					"available": frappe.db.count("Expo Stall", {"expo_hall": hall["name"], "status": "Available"}),
					"hold":      frappe.db.count("Expo Stall", {"expo_hall": hall["name"], "status": "Hold"}),
					"booked":    frappe.db.count("Expo Stall", {"expo_hall": hall["name"], "status": "Booked"}),
					"blocked":   frappe.db.count("Expo Stall", {"expo_hall": hall["name"], "status": "Blocked"}),
				}
				if t["Expo Stall"] else
				{"available": 0, "hold": 0, "booked": 0, "blocked": 0}
			)

	# ── Services ──────────────────────────────────────────────
	services = []
	if t["Expo Service"]:
		services = frappe.get_all(
			"Expo Service",
			filters={"expo_event": event.name},
			fields=[
				"name", "service_name", "category",
				"description", "image",
				"charge_type", "price", "tax_percent",
				"is_mandatory", "cutoff_date",
			],
			order_by="is_mandatory desc, category asc",
		)

	# ── Exhibitors ────────────────────────────────────────────
	exhibitors = []
	if t["Exhibitor Profile"]:
		exhibitors = frappe.get_all(
			"Exhibitor Profile",
			filters={"expo_event": event.name, "status": "Active"},
			fields=[
				"name", "exhibitor_name", "company_name",
				"industry", "company_logo", "description",
				"website", "product_categories",
				"has_digital_booth",
				"booth_tagline", "booth_description", "booth_products",
				"booth_website", "booth_video_url",
				"booth_contact_email", "booth_contact_phone", "booth_banner",
			],
			limit=50,
		)

	# ── Booking summary ───────────────────────────────────────
	booking_summary = (
		{
			"total":           frappe.db.count("Stall Booking", {"expo_event": event.name}),
			"confirmed":       frappe.db.count("Stall Booking", {"expo_event": event.name, "docstatus": 1}),
			"pending_payment": frappe.db.count("Stall Booking", {"expo_event": event.name, "payment_status": "Pending"}),
			"paid":            frappe.db.count("Stall Booking", {"expo_event": event.name, "payment_status": "Paid"}),
		}
		if t["Stall Booking"] else
		{"total": 0, "confirmed": 0, "pending_payment": 0, "paid": 0}
	)

	crm_lead_count = (
		frappe.db.count("CRM Lead", {"expo_event": event.name})
		if t["CRM Lead"] else 0
	)

	return {
		"event":           event.as_dict(),
		"halls":           halls,
		"services":        services,
		"exhibitors":      exhibitors,
		"booking_summary": booking_summary,
		"crm_lead_count":  crm_lead_count,
	}


# ─────────────────────────────────────────────────────────────
#  API 3 — Create Booking
# ─────────────────────────────────────────────────────────────

@frappe.whitelist()
def create_booking(
	expo_event,
	selected_dims,
	selected_services,
	stall_amount,
	service_amount,
	tax_amount,
	total_amount,
	deposit_paid,
	balance_due,
):
	# Parse JSON strings
	if isinstance(selected_dims, str):
		selected_dims = json.loads(selected_dims)
	if isinstance(selected_services, str):
		selected_services = json.loads(selected_services)

	# Get logged-in exhibitor
	user_email = frappe.session.user
	exhibitor = frappe.db.get_value(
		"Exhibitor Profile",
		{"email": user_email},
		["name", "exhibitor_name"],
		as_dict=True,
	)
	if not exhibitor:
		frappe.throw("Exhibitor profile not found. Please complete your registration.")

	# Collect stall names and numbers from selected dims
	stall_names   = [d.get("stall_name")   for d in selected_dims if d.get("stall_name")]
	stall_numbers = [d.get("stall_number") for d in selected_dims if d.get("stall_number")]

	# Build readable stall reference string
	# Format: "H1-004 (3×3 m) | H1-010 (3×3 m) | H1-102 (6×6 m)"
	stall_number_ref = " | ".join([
		f"{d.get('stall_number', '')} ({d.get('dimension_label', '')} m)"
		for d in selected_dims
	])

	# First stall name for the Link field (admin can update later)
	primary_stall = stall_names[0] if stall_names else None

	booking = frappe.get_doc({
		"doctype":        "Stall Booking",
		"expo_event":     expo_event,
		"exhibitor":      exhibitor.name,
		"exhibitor_name": exhibitor.exhibitor_name,
		"stall":          primary_stall,    # Link field — first stall
		"stall_number":   stall_number_ref, # Full readable reference
		"booking_date":   now(),
		"payment_status": "Pending",
		"base_amount":    float(stall_amount or 0),
		"tax_amount":     float(tax_amount or 0),
		"total_amount":   float(total_amount or 0),
		"deposit_paid":   float(deposit_paid or 0),
		"balance_due":    float(balance_due or 0),
	})

	# Add services to child table
	for svc in selected_services:
		booking.append("services", {
			"service": svc.get("service") or svc.get("name", ""),
			"price":   float(svc.get("price", 0)),
		})

	booking.flags.ignore_mandatory = True
	booking.flags.ignore_links      = True
	booking.insert(ignore_permissions=True)

	# Mark all picked stalls as "Hold" (Booked after payment)
	for stall_name in stall_names:
		if frappe.db.exists("Expo Stall", stall_name):
			frappe.db.set_value("Expo Stall", stall_name, "status", "Hold")

	frappe.db.commit()

	return {
		"booking_id":    booking.name,
		"status":        "success",
		"stall_numbers": stall_numbers,
		"total_amount":  float(total_amount or 0),
		"deposit_paid":  float(deposit_paid or 0),
		"balance_due":   float(balance_due or 0),
	}


# ─────────────────────────────────────────────────────────────
#  API 4 — Get My Bookings
# ─────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────
#  API 5 — Get Available Stalls for a Hall + Dimension
# ─────────────────────────────────────────────────────────────

@frappe.whitelist()
def get_available_stalls(expo_event, expo_hall, dimension_label):
	"""Return available stalls for a specific hall + dimension combo."""
	if not frappe.db.table_exists("Expo Stall"):
		return []

	# Normalize dimension_label: replace 'x' with '×' for consistency
	dimension_label = dimension_label.replace('x', '×').strip()

	stalls = frappe.get_all(
		"Expo Stall",
		filters={
			"expo_event":      expo_event,
			"expo_hall":       expo_hall,
			"dimension_label": dimension_label,
			"status":          "Available",
		},
		fields=[
			"name", "stall_number", "stall_type",
			"dimension_label", "base_price", "final_price",
			"status", "expo_hall",
		],
		order_by="stall_number asc",
	)

	# If no results with ×, try with x as fallback
	if not stalls:
		fallback_label = dimension_label.replace('×', 'x')
		stalls = frappe.get_all(
			"Expo Stall",
			filters={
				"expo_event":      expo_event,
				"expo_hall":       expo_hall,
				"dimension_label": fallback_label,
				"status":          "Available",
			},
			fields=[
				"name", "stall_number", "stall_type",
				"dimension_label", "base_price", "final_price",
				"status", "expo_hall",
			],
			order_by="stall_number asc",
		)

	return stalls


@frappe.whitelist()
def get_my_bookings(expo_event=None):
    user_email = frappe.session.user

    # frappe_user → email fallback
    exhibitor_name = frappe.db.get_value("Exhibitor Profile", {"frappe_user": user_email}, "name")
    if not exhibitor_name:
        exhibitor_name = frappe.db.get_value("Exhibitor Profile", {"email": user_email}, "name")
    if not exhibitor_name:
        return []

    filters = {"exhibitor": exhibitor_name}
    if expo_event:
        filters["expo_event"] = expo_event

    bookings = frappe.get_all(
        "Stall Booking",
        filters=filters,
        fields=[
            "name", "expo_event", "exhibitor_name",
            "stall", "stall_number", "booking_date",
            "payment_status", "base_amount", "tax_amount",
            "total_amount", "deposit_paid", "balance_due",
            "service_amount",
        ],
        order_by="creation desc",
    )

    # ── Services child table attach ───────────────────────
    for booking in bookings:
        services = frappe.get_all(
            "Booking Service Item",
            filters={"parent": booking["name"]},
            fields=["service", "price"],
        )
        booking["services"] = services if services else []

    return bookings