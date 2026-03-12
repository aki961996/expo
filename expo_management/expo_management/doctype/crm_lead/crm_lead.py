import frappe
from frappe.model.document import Document


class CRMLead(Document):

	def validate(self):
		# Auto-set exhibitor name
		if self.exhibitor and not self.exhibitor_name:
			self.exhibitor_name = frappe.db.get_value(
				"Exhibitor Profile", self.exhibitor, "exhibitor_name"
			)

	def after_insert(self):
		# Notify assigned staff
		if self.assigned_staff:
			frappe.publish_realtime(
				"new_crm_lead",
				{
					"lead": self.name,
					"lead_name": self.lead_name,
					"rating": self.lead_rating,
					"assigned_to": self.assigned_staff,
				},
				user=self.assigned_staff,
				after_commit=True,
			)
