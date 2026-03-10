// Copyright (c) 2026, Your Company
// Client Script for Expo Event DocType

frappe.ui.form.on('Expo Event', {

	// ── On form load ───────────────────────────────────────────
	onload(frm) {
		// Set default status colour indicators
		frm.set_indicator_formatter('status', function(doc) {
			const map = {
				'Draft':     'gray',
				'Upcoming':  'blue',
				'Ongoing':   'green',
				'Completed': 'darkgrey',
				'Cancelled': 'red',
			};
			return map[doc.status] || 'gray';
		});
	},

	// ── Refresh ────────────────────────────────────────────────
	refresh(frm) {
		// Show "View on Website" button if published
		if (frm.doc.is_published && !frm.doc.__islocal) {
			frm.add_web_link(`/expo/${frm.doc.name}`, __('View on Website'));
		}

		// Custom button to generate stalls from dimensions
		if (!frm.doc.__islocal && frm.doc.docstatus === 0) {
			frm.add_custom_button(__('Generate Stall Inventory'), () => {
				frappe.confirm(
					'This will auto-create Expo Stall records from hall dimensions. Continue?',
					() => {
						frappe.call({
							method: 'expo_management.expo_management.doctype.expo_stall.expo_stall.generate_stalls_for_event',
							args: { expo_event: frm.doc.name },
							callback(r) {
								frappe.msgprint(`✅ ${r.message}`);
								frm.reload_doc();
							},
						});
					}
				);
			}, __('Actions'));
		}
	},

	// ── Auto-generate short code from event name ───────────────
	event_name(frm) {
		if (!frm.doc.event_short_code && frm.doc.event_name) {
			const year = new Date().getFullYear();
			const initials = frm.doc.event_name
				.split(' ')
				.map(w => w[0])
				.join('')
				.toUpperCase()
				.slice(0, 4);
			frm.set_value('event_short_code', initials + year);
		}
	},

	// ── Validate date order on change ─────────────────────────
	start_date(frm) {
		if (frm.doc.start_date && frm.doc.end_date) {
			if (frm.doc.start_date > frm.doc.end_date) {
				frappe.msgprint({ message: __('Start Date is after End Date!'), indicator: 'red' });
			}
		}
	},

	end_date(frm) {
		if (frm.doc.start_date && frm.doc.end_date) {
			if (frm.doc.start_date > frm.doc.end_date) {
				frappe.msgprint({ message: __('End Date is before Start Date!'), indicator: 'red' });
			}
		}
	},
});
