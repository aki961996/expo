import frappe
from frappe.model.document import Document


class StallBooking(Document):

	def validate(self):
		self._recalculate_totals()

	def _recalculate_totals(self):
		"""
		Auto-recalculate whenever admin edits service rates.

		Design:
		  - base_amount   = stall total (set at booking, not touched here)
		  - service_amount = sum of service rows (rate × qty)
		    → At booking time: all rates are 0 (admin fills later)
		    → After admin edits rate: recalculates automatically on Save
		  - tax_amount    = (base_amount + service_amount) × 18%
		  - total_amount  = base_amount + service_amount + tax_amount
		  - deposit_paid  = base_amount × 25%  (stall only — services in invoice)
		  - balance_due   = total_amount - deposit_paid
		"""

		# Step 1: recalculate each service row amount
		service_total = 0.0
		for row in self.get("services") or []:
			qty    = float(row.qty  or 1)
			rate   = float(row.rate or 0)
			amount = round(qty * rate, 2)
			row.amount     = amount
			service_total += amount

		# Step 2: recompute header fields
		base      = float(self.base_amount or 0)
		sub_total = base + service_total
		tax       = round(sub_total * 0.18)
		total     = sub_total + tax
		deposit   = round(base * 0.25)
		balance   = total - deposit

		self.service_amount = round(service_total, 2)
		self.tax_amount     = tax
		self.total_amount   = total
		self.deposit_paid   = deposit
		self.balance_due    = balance