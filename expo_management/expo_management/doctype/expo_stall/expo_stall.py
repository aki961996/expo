import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime, add_to_date


class ExpoStall(Document):

	def validate(self):
		if self.status == "Hold" and not self.hold_expiry:
			# Auto-set hold expiry to 15 minutes from now
			self.hold_expiry = add_to_date(now_datetime(), minutes=15)

		if self.status != "Hold":
			self.hold_expiry = None

	def on_update(self):
		# Broadcast stall status change to React frontend (live map update)
		frappe.publish_realtime(
			"stall_status_changed",
			{
				"stall":     self.name,
				"event":     self.expo_event,
				"hall":      self.expo_hall,
				"status":    self.status,
				"stall_number": self.stall_number,
			},
			after_commit=True,
		)


# ─── Whitelisted APIs ─────────────────────────────────────────

@frappe.whitelist()
def hold_stall(stall_name, exhibitor):
	"""Hold a stall for 15 minutes during checkout."""
	stall = frappe.get_doc("Expo Stall", stall_name)

	if stall.status != "Available":
		frappe.throw(f"Stall {stall.stall_number} is not available. Current status: {stall.status}")

	stall.status     = "Hold"
	stall.booked_by  = exhibitor
	stall.hold_expiry = add_to_date(now_datetime(), minutes=15)
	stall.save(ignore_permissions=True)
	frappe.db.commit()

	return {
		"stall":       stall.name,
		"status":      stall.status,
		"hold_expiry": str(stall.hold_expiry),
	}


@frappe.whitelist()
def release_hold(stall_name):
	"""Manually release a stall hold (user cancels cart)."""
	stall = frappe.get_doc("Expo Stall", stall_name)

	if stall.status == "Hold":
		stall.status     = "Available"
		stall.booked_by  = None
		stall.hold_expiry = None
		stall.save(ignore_permissions=True)
		frappe.db.commit()

	return {"stall": stall.name, "status": "Available"}


@frappe.whitelist(allow_guest=True)
def get_stalls_for_hall(expo_hall):
	"""Return all stalls for a hall — used in React stall map."""
	return frappe.get_all(
		"Expo Stall",
		filters={"expo_hall": expo_hall},
		fields=[
			"name", "stall_number", "stall_type",
			"dimension_label", "status", "final_price",
			"map_x", "map_y", "map_width", "map_height",
		],
		order_by="stall_number asc",
	)
