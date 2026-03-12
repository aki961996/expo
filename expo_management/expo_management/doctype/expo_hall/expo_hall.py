import frappe
from frappe.model.document import Document


class ExpoHall(Document):

	def validate(self):
		self._validate_area()

	def _validate_area(self):
		if self.area and self.area <= 0:
			frappe.throw("Area must be greater than 0")

	def after_insert(self):
		frappe.publish_realtime(
			"expo_hall_created",
			{"hall": self.name, "event": self.expo_event},
			after_commit=True,
		)
