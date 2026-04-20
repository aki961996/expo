import frappe
from frappe.model.document import Document


class StallBooking(Document):

	def validate(self):
		self._recalculate_totals()

	def _recalculate_totals(self):
		"""
		Auto-recalculate whenever admin edits service rates or qty.

		Formula:
		  base_amount    = stall total (set at booking creation, not changed here)
		  service_amount = sum of (rate × qty) from Services child table
		  sub_total      = base_amount + service_amount
		  tax_amount     = round(sub_total × 0.18)
		  total_amount   = sub_total + tax_amount
		  deposit_paid   = round(base_amount × 0.25)   ← 25% of stall only
		  balance_due    = total_amount - deposit_paid
		"""

		# ── 1. Recalculate each service row amount ────────────
		service_total = 0.0
		for row in self.get("services") or []:
			qty    = float(row.qty    or 1)
			rate   = float(row.rate   or 0)
			amount = round(qty * rate, 2)
			row.amount     = amount
			service_total += amount

		# ── 2. Recompute header totals ────────────────────────
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