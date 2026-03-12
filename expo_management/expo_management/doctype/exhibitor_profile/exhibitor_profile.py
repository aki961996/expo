import frappe
from frappe.model.document import Document


class ExhibitorProfile(Document):

	def validate(self):
		self._validate_email()

	def _validate_email(self):
		if self.email and not frappe.utils.validate_email_address(self.email):
			frappe.throw(f"Invalid email address: {self.email}")

	def after_insert(self):
		# Send welcome email when admin approves
		if self.status == "Active":
			self._send_welcome_email()

	def on_update(self):
		# When status changes to Active, send welcome email
		if self.has_value_changed("status") and self.status == "Active":
			self._send_welcome_email()

	def _send_welcome_email(self):
		try:
			frappe.sendmail(
				recipients=[self.email],
				subject=f"Welcome to the Expo — {self.company_name}",
				message=f"""
					<p>Dear {self.exhibitor_name},</p>
					<p>Your exhibitor registration has been approved!</p>
					<p>You can now log in to the Expo Management portal.</p>
				""",
			)
		except Exception:
			pass  # Don't fail if email send fails
