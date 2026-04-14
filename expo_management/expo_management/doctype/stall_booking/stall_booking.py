import frappe
from frappe.model.document import Document
from frappe.utils import flt


class StallBooking(Document):

	def validate(self):
		self._calculate_amounts()

	def on_submit(self):
		if self.stall:
			self._update_stall_status("Booked")
		self._generate_invoice_number()

	def on_cancel(self):
		if self.stall:
			self._update_stall_status("Available")

	def _calculate_amounts(self):
		"""
		DO NOT recalculate base_amount / tax_amount / total_amount
		DO NOT override stall_number
		These are passed from create_booking API — preserve them.
		Only recalculate balance_due.
		"""
		# Service total using correct 'rate' field
		service_total = sum(flt(s.rate) for s in (self.services or []))

		# Only auto-fill amounts if base_amount not passed (fallback)
		if not flt(self.base_amount) and self.stall:
			if frappe.db.exists("Expo Stall", self.stall):
				stall            = frappe.get_doc("Expo Stall", self.stall)
				self.base_amount = flt(stall.final_price)
				tax_rate         = flt(stall.tax_percent) / 100 if stall.tax_percent else 0.18
				self.tax_amount  = flt((flt(self.base_amount) + service_total) * tax_rate, 2)
				self.total_amount = flt(
					flt(self.base_amount) + service_total + self.tax_amount, 2
				)

		# Always recalculate balance_due only
		if flt(self.total_amount):
			self.balance_due = flt(flt(self.total_amount) - flt(self.deposit_paid), 2)

	def _update_stall_status(self, status):
		frappe.db.set_value("Expo Stall", self.stall, {
			"status":    status,
			"booked_by": self.exhibitor if status == "Booked" else None,
		})
		frappe.db.commit()

	def _generate_invoice_number(self):
		if not self.invoice_number:
			self.invoice_number = f"INV-{self.name}"
			self.db_update()


class BookingServiceItem(Document):
	pass