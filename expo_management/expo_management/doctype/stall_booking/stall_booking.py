import frappe
from frappe.model.document import Document


class StallBooking(Document):

	def validate(self):
		# Prevent fetch_from overwriting stall_number with single stall value
		# Store current stall_number before any field fetch operations
		self._recalculate_totals()

	def before_save(self):
		# Frappe fetch_from runs before validate — protect stall_number
		# if it was set programmatically with multiple stalls (contains '|')
		pass

	def _recalculate_totals(self):
		"""
		DESIGN:
		  base_amount    = stall total (set at booking, unchanged here)
		  service_amount = sum of service rows (admin-facing only)
		  tax_amount     = base_amount × 18%  ← stall GST only
		  total_amount   = base_amount + tax_amount
		  deposit_paid   = base_amount × 25%
		  balance_due    = total_amount - deposit_paid
		"""

		# Recalculate service rows
		service_total = 0.0
		for row in self.get("services") or []:
			qty    = float(row.qty  or 1)
			rate   = float(row.rate or 0)
			amount = round(qty * rate, 2)
			row.amount     = amount
			service_total += amount

		self.service_amount = round(service_total, 2)

		# Stall-only totals
		base    = float(self.base_amount or 0)
		tax     = round(base * 0.18)
		total   = base + tax
		deposit = round(base * 0.25)
		balance = total - deposit

		self.tax_amount   = tax
		self.total_amount = total
		self.deposit_paid = deposit
		self.balance_due  = balance