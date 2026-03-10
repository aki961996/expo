# Copyright (c) 2026, faircode contribution
# akhilesh vadakkekkara

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
		td = getdate(today())
		start = getdate(self.start_date)
		end = getdate(self.end_date)
		if td < start:
			self.status = "Upcoming"
		elif start <= td <= end:
			self.status = "Ongoing"
		else:
			self.status = "Completed"


# ─────────────────────────────────────────────────────────────
#  PUBLIC API
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
			["event_name", "like", f"%{search}%"],
			["venue_name", "like", f"%{search}%"],
			["city",       "like", f"%{search}%"],
		]

	events = frappe.get_all(
		"Expo Event",
		filters=filters,
		or_filters=or_filters,
		fields=[
			"name", "event_name", "event_short_code",
			"category", "business_type", "organizer_name",
			"description", "logo", "banner",
			"start_date", "end_date",
			"venue_name", "city", "country",
			"status", "visitor_capacity", "exhibitor_capacity",
			"has_wifi", "has_ac", "has_food_court",
			"has_atm", "has_first_aid", "has_prayer_room",
		],
		order_by="start_date asc",
		limit=int(limit),
		start=int(offset),
	)

	# Safe counts — only query tables that actually exist
	hall_table_exists = frappe.db.table_exists("Expo Hall")

	for ev in events:
		# Stall Booking table ഇല്ലാത്തതുകൊണ്ട് 0 കൊടുക്കുന്നു
		ev["exhibitor_count"] = 0

		# Hall count — table ഉണ്ടെങ്കിൽ മാത്രം query
		ev["hall_count"] = (
			frappe.db.count("Expo Hall", {"expo_event": ev["name"]})
			if hall_table_exists else 0
		)

	total = frappe.db.count("Expo Event", filters)

	return {"events": events, "total": total}


@frappe.whitelist(allow_guest=True)
def get_event_detail(event_code):

	if not frappe.db.exists("Expo Event", event_code):
		frappe.throw(f"Event '{event_code}' not found", frappe.DoesNotExistError)

	event = frappe.get_doc("Expo Event", event_code)

	if not event.is_published:
		frappe.throw("This event is not published.", frappe.PermissionError)

	# Halls — table ഉണ്ടെങ്കിൽ മാത്രം
	halls = []
	if frappe.db.table_exists("Expo Hall"):
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
				if frappe.db.table_exists("Expo Stall Dimension") else []
			)

	# Services — table ഉണ്ടെങ്കിൽ മാത്രം
	services = []
	if frappe.db.table_exists("Expo Service"):
		services = frappe.get_all(
			"Expo Service",
			filters={"expo_event": event.name},
			fields=[
				"name", "service_name", "category", "description",
				"image", "charge_type", "price", "tax_percent",
				"is_mandatory", "cutoff_date",
			],
		)

	# Exhibitors — table ഉണ്ടെങ്കിൽ മാത്രം
	exhibitors = []
	if frappe.db.table_exists("Exhibitor Profile"):
		exhibitors = frappe.get_all(
			"Exhibitor Profile",
			filters={"expo_event": event.name, "status": "Active"},
			fields=[
				"name", "exhibitor_name", "company_name",
				"industry", "company_logo", "description", "website",
			],
			limit=50,
		)

	return {
		"event": event.as_dict(),
		"halls": halls,
		"services": services,
		"exhibitors": exhibitors,
	}