import frappe
from frappe.model.document import Document
from frappe.utils import flt


class StallBooking(Document):

	def validate(self):
		self._calculate_amounts()

	def on_submit(self):
		# Mark stall as Booked
		self._update_stall_status("Booked")
		self._generate_invoice_number()

	def on_cancel(self):
		# Release stall back to Available
		self._update_stall_status("Available")

	def _calculate_amounts(self):
		"""Auto-calculate tax and total from base amount."""
		stall = frappe.get_doc("Expo Stall", self.stall)
		self.base_amount = flt(stall.final_price)

		# Add service amounts
		service_total = sum(flt(s.amount) for s in self.services)
		self.base_amount += service_total

		# GST on total
		tax_rate = flt(stall.tax_percent) / 100
		self.tax_amount = flt(self.base_amount * tax_rate, 2)
		self.total_amount = flt(self.base_amount + self.tax_amount, 2)

		# Balance due
		self.balance_due = flt(self.total_amount - flt(self.deposit_paid), 2)

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


# ─── Child DocType for services in booking ───────────────────

class BookingServiceItem(Document):
	pass
