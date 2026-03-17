
import frappe
from frappe.model.document import Document
from frappe.utils import today, getdate


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
	"""
	SRS document-ൽ mention ചെയ്ത എല്ലാ DocTypes-നും
	table exist ആണോ എന്ന് ഒരിക്കൽ check ചെയ്യുന്നു.
	migrate ചെയ്യാത്ത DocTypes error ഉണ്ടാക്കില്ല.
	"""
	return {
		# Hall & Stall Management
		"Expo Hall":            frappe.db.table_exists("Expo Hall"),
		"Expo Stall":           frappe.db.table_exists("Expo Stall"),
		"Expo Stall Dimension": frappe.db.table_exists("Expo Stall Dimension"),

		# Booking & Payment
		"Stall Booking":        frappe.db.table_exists("Stall Booking"),

		# Exhibitor Management
		"Exhibitor Profile":    frappe.db.table_exists("Exhibitor Profile"),

		# Services Management
		"Expo Service":         frappe.db.table_exists("Expo Service"),

		# CRM Module
		"CRM Lead":             frappe.db.table_exists("CRM Lead"),

		# Facilities (future)
		"Expo Facility":        frappe.db.table_exists("Expo Facility"),
	}


# ─────────────────────────────────────────────────────────────
#  API 1 — Event Listing Page
# ─────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=True)
def get_published_events(status=None, category=None, search=None, limit=20, offset=0):
	"""
	React Event Listing page-ൽ ഉപയോഗിക്കുന്നു.
	Published events list + counts return ചെയ്യുന്നു.
	"""

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
			# Basic info
			"name", "event_name", "event_short_code",
			"category", "business_type", "organizer_name",
			"description", "logo", "banner",
			# Dates
			"start_date", "end_date", "setup_start_date", "dismantle_date",
			# Venue
			"venue_name", "city", "country",
			# Status
			"status", "visitor_capacity", "exhibitor_capacity",
			# Facilities (SRS: facilities section)
			"has_wifi", "has_ac", "has_food_court", "has_atm",
			"has_first_aid", "has_fire_safety", "has_security",
			"has_drinking_water", "has_prayer_room",
			# Parking (SRS: Vehicle Parking)
			"parking_cars", "parking_trucks",
			"washrooms_male", "washrooms_female", "washrooms_accessible",
		],
		order_by="start_date asc",
		limit=int(limit),
		start=int(offset),
	)

	# ── Table existence check — one time──────────────
	t = _get_existing_tables()

	for ev in events:
		n = ev["name"]

		# ── Hall count (SRS: Hall/Stall Management) ───────────
		ev["hall_count"] = (
			frappe.db.count("Expo Hall", {"expo_event": n})
			if t["Expo Hall"] else 0
		)

		# ── Stall counts (SRS: Stall inventory) ───────────────
		ev["total_stalls"] = (
			frappe.db.count("Expo Stall", {"expo_event": n})
			if t["Expo Stall"] else 0
		)
		ev["available_stalls"] = (
			frappe.db.count("Expo Stall", {"expo_event": n, "status": "Available"})
			if t["Expo Stall"] else 0
		)

		# ── Exhibitor count (SRS: Exhibitor management) ───────
		# Confirmed bookings = docstatus 1 (submitted)
		ev["exhibitor_count"] = (
			frappe.db.count("Stall Booking", {"expo_event": n, "docstatus": 1})
			if t["Stall Booking"] else 0
		)

		# ── Service count (SRS: Services Management) ──────────
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
	"""
	React Event Detail page-ൽ ഉപയോഗിക്കുന്നു.
	One event-ന്റെ full data return ചെയ്യുന്നു.
	"""

	if not frappe.db.exists("Expo Event", event_code):
		frappe.throw(f"Event '{event_code}' not found", frappe.DoesNotExistError)

	event = frappe.get_doc("Expo Event", event_code)

	if not event.is_published:
		frappe.throw("This event is not published.", frappe.PermissionError)

	t = _get_existing_tables()

	# ── 1. Halls + Dimensions + Stall summary ─────────────────
	# SRS: Hall/Stall Specifications, Stall inventory
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

			# Stall dimensions (SRS: Dimensions, Base Price, Corner/Island Premium)
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

			# Stall status counts (SRS: Status — available, hold, blocked)
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

	# ── 2. Services ───────────────────────────────────────────
	# SRS: Additional Power Load, Extra Chairs, Booth Fabrication,
	#      Internet Line, Branding Standee + custom services
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

	# ── 3. Exhibitors (public info) ───────────────────────────
	# SRS: Exhibitor listing — Company name, Industry, Logo
	exhibitors = []
	if t["Exhibitor Profile"]:
		# exhibitors = frappe.get_all(
		# 	"Exhibitor Profile",
		# 	filters={"expo_event": event.name, "status": "Active"},
		# 	fields=[
		# 		"name", "exhibitor_name", "company_name",
		# 		"industry", "company_logo", "description",
		# 		"website", "product_categories",
		# 	],
		# 	limit=50,
		# )
		exhibitors = frappe.get_all(
			"Exhibitor Profile",
			filters={"expo_event": event.name, "status": "Active"},
			fields=[
				"name", "exhibitor_name", "company_name",
				"industry", "company_logo", "description",
				"website", "product_categories",
				# Digital booth fields
				"has_digital_booth",
				"booth_tagline", "booth_description", "booth_products",
				"booth_website", "booth_video_url",
				"booth_contact_email", "booth_contact_phone", "booth_banner",
			],
			limit=50,
		)

	# ── 4. Booking summary ────────────────────────────────────
	# SRS: Booking and Payment control
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

	# ── 5. CRM lead count ─────────────────────────────────────
	# SRS: Exhibitor CRM Module
	crm_lead_count = (
		frappe.db.count("CRM Lead", {"expo_event": event.name})
		if t["CRM Lead"] else 0
	)

	return {
		"event":           event.as_dict(),
		"halls":           halls,          # Hall + dimensions + stall summary
		"services":        services,       # All services for this event
		"exhibitors":      exhibitors,     # Active exhibitors
		"booking_summary": booking_summary,# Payment & booking stats
		"crm_lead_count":  crm_lead_count, # Total CRM leads
	}