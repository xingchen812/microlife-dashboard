import React from 'react'
import PropTypes from 'prop-types'
import RequestEditor from './RequestEditor'
import DashboardConfig from './DashboardConfig'
import RequestForm from './RequestForm'

export default function App(props) {
	if (typeof props.data !== 'object' || props.data.component === undefined) {
		return undefined
	}

	switch (props.data.component) {
		case 'dashboard_config':
			return <DashboardConfig {...props} />

		case 'request_editor':
			return <RequestEditor {...props} />

		case 'request_form':
			return <RequestForm {...props} />

		default:
			return <div>Unknown component name: {props.data.component}</div>
	}
}

App.propTypes = {
	data: PropTypes.any,
}
