import frappe
from frappe.model.document import Document


class StallBooking(Document):

	def validate(self):
		self._recalculate_totals()

	def _recalculate_totals(self):
		"""
		Recalculate when admin edits service rates.

		DESIGN:
		  base_amount    = stall total (set at booking, unchanged here)
		  service_amount = sum of service rows (admin-facing only)
		  tax_amount     = base_amount × 18%  ← stall GST only
		  total_amount   = base_amount + tax_amount  ← stall + stall GST
		  deposit_paid   = base_amount × 25%
		  balance_due    = total_amount - deposit_paid

		  service_amount is stored for admin reference but NOT
		  added to total_amount shown to exhibitor.
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

		# Totals based on stall only (service is separate)
		base    = float(self.base_amount or 0)
		tax     = round(base * 0.18)
		total   = base + tax            # stall + stall GST only
		deposit = round(base * 0.25)
		balance = total - deposit

		self.tax_amount   = tax
		self.total_amount = total
		self.deposit_paid = deposit
		self.balance_due  = balance