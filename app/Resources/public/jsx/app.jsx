var CustomerFilters = React.createClass({
	handleFilterChanged: function(filter, event) {
		event.preventDefault();

		var filters = this.state.filters;
		filters[filter.name].enabled = !filters[filter.name].enabled;
		if( filters[filter.name].enabled ) {
			var unset = filters[filter.name].unset;
			for( var i = 0; i < unset.length; i++ ) {
				filters[unset[i]].enabled = false;
			}
		}
		var textEnabled = Object.keys(filters).some(function(element, index, array) {
			return filters[element].usesText && filters[element].enabled;
		});

		this.setState({
			filters: filters,
			textEnabled: textEnabled,
		})
		this.props.filterFieldsChanged(filters);
	},
	handleTextChanged: function(event) {
		this.props.filterTextChanged(event.target.value);
	},
	getInitialState: function() {
		var filters = {
			name: {
				name: "name",
				label: "by name",
				enabled: false,
				usesText: true,
				unset: ["state", "type"],
			},
			state: {
				name: "state",
				label: "by state",
				enabled: false,
				usesText: true,
				unset: ["name", "type"],
			},
			type: {
				name: "type",
				label: "by type",
				enabled: false,
				usesText: true,
				unset: ["name", "state"],
			},
			cClients: {
				name: "cClients",
				label: "current clients",
				enabled: false,
				usesText: false,
				unset: ["pClients"],
			},
			pClients: {
				name: "pClients",
				label: "prospective clients",
				enabled: false,
				usesText: false,
				unset: ["cClients"],
			},
		};
		return {
			filters: filters,
			sortedFilters: [
				filters.name,
				filters.state,
				filters.type,
				filters.cClients,
				filters.pClients,
			],
			textEnabled: false,
		};
	},
	render: function() {
		return (
			<div className="row customer-filters">
				<div className="small-12 columns">
					<dl>
						<dt>Filter:</dt>
						{this.state.sortedFilters.map(function(filter) {
							return <dd key={filter.name} onClick={this.handleFilterChanged.bind(this, filter)} className={filter.enabled ? 'active' : ''}><a href="#">{filter.label}</a></dd>;
						}.bind(this))}
					</dl>
					<div className="row">
						<div className="small-12 columns">
							<input onChange={this.handleTextChanged} type="text" placeholder="Enter text to filter by" disabled={this.state.textEnabled ? "" : "disabled"} />
						</div>
					</div>
				</div>
			</div>
		);
	},
});

var CustomerNode = React.createClass({
	handleSelectionChanged: function(customer) {
		this.props.toggleSelectedCustomer(customer.id);
	},
	handleEditClicked: function(customer, event) {
		event.preventDefault();
		customer.selected = customer.selected === true ? false : true;
		this.forceUpdate();
	},
	handleDeleteClicked: function(customer, event) {
		event.preventDefault();
		var message = "This will permanently delete '" + customer.name + "'!";
		// FIXME: this is functional but ugly.
		if( !confirm(message) ) {
			return;
		}
		this.props.deleteCustomer([{
			id: customer.id,
		}]);
	},
	handleUpdateClicked: function(customer, event) {
		event.preventDefault();
		var makeRequest = true;
		Object.keys(this.refs).forEach(function(value, index, array) {
			var domNode = this.refs[value].getDOMNode();
			if( !domNode.willValidate ) {
				return;
			}
			if( !domNode.checkValidity() ) {
				makeRequest = false;
				domNode.className = 'error';
				this.refs[value + '-error'].getDOMNode().className = 'error';
			} else {
				domNode.className = '';
				this.refs[value + '-error'].getDOMNode().className = 'hide';
			}
		}.bind(this));
		if( !makeRequest ) {
			return;
		}
		this.props.updateCustomer([{
			id:    customer.id,
			name:  this.refs.name.getDOMNode().value,
			state: this.refs.state.getDOMNode().value,
			type:  this.refs.type.getDOMNode().value,
		}]);
	},
	render: function() {
		var selected = this.props.customer.selected === true ? true : false;

		if( selected ) {
			return (
				<tr>
					<td className="select"><input type="checkbox" checked={selected} onChange={this.handleSelectionChanged.bind(this, this.props.customer)} /></td>
					<td className="name">
						<input type="text" ref="name" defaultValue={this.props.customer.name} maxLength="32" pattern={this.props.validations.name.pattern} />
						<small ref="name-error" className="hide">{this.props.validations.name.message}</small>
					</td>
					<td className="state">
						<input type="text" ref="state" defaultValue={this.props.customer.state} maxLength="2" pattern={this.props.validations.state.pattern} />
						<small ref="state-error" className="hide">{this.props.validations.state.message}</small>
					</td>
					<td className="type">
						<input type="text" ref="type" defaultValue={this.props.customer.type} maxLength="1" pattern={this.props.validations.type.pattern} />
						<small ref="type-error" className="hide">{this.props.validations.type.message}</small>
					</td>
					<td className="actions">
						<button onClick={this.handleEditClicked.bind(this, this.props.customer)} className="button tiny radius">CANCEL</button>
						<button onClick={this.handleUpdateClicked.bind(this, this.props.customer)} className="button tiny radius warning">UPDATE</button>
					</td>
				</tr>
			);
		} else {
			return (
				<tr>
					<td className="select"><input type="checkbox" checked={selected} onChange={this.handleSelectionChanged.bind(this, this.props.customer)} /></td>
					<td className="name">{this.props.customer.name}</td>
					<td className="state">{this.props.customer.state}</td>
					<td className="type">{this.props.customer.type}</td>
					<td className="actions">
						<button onClick={this.handleEditClicked.bind(this, this.props.customer)} className="button tiny radius">EDIT</button>
						<button onClick={this.handleDeleteClicked.bind(this, this.props.customer)} className="button tiny radius alert">DELETE</button>
					</td>
				</tr>
			);
		}
	},
});

var CustomerListHeader = React.createClass({
	handleSelectionChanged: function(event) {
		this.props.selectAllCustomers(event.target.checked);
	},
	handleSortingChanged: function(event) {
		this.props.sortByField(event.target.className);
	},
	render: function() {
		return (
			<thead>
				<tr>
					<th className="select"><input type="checkbox" checked={this.props.selectAll} onChange={this.handleSelectionChanged} /></th>
					<th className="name" onClick={this.handleSortingChanged}>Name</th>
					<th className="state" onClick={this.handleSortingChanged}>State</th>
					<th className="type" onClick={this.handleSortingChanged}>Type</th>
					<th className="actions">Actions</th>
				</tr>
			</thead>
		);
	}
});

var CustomerList = React.createClass({
	updateCustomers: function(params) {
		var
			customersAll = params.customersAll === undefined ? this.state.customersAll : params.customersAll,
			customers    = params.customers === undefined ? this.state.customers : params.customers,
			sortKey      = params.sortKey === undefined ? this.state.sortKey : params.sortKey,
			sortReverse  = params.sortReverse === undefined ? this.state.sortReverse : params.sortReverse,
			filters      = params.filters === undefined ? this.state.filters : params.filters,
			filterText   = params.filterText === undefined ? this.state.filterText : params.filterText;

		// Filter the customers.
		var filteredCustomers = customersAll;
		Object.keys(filters).forEach(function(value, index, array) {
			if( !filters[value].enabled ) {
				return;
			}
			if( value == "cClients" ) {
				filteredCustomers = filteredCustomers.filter(function(customer) {
					if( customer.type !== null ) {
						return true;
					}
					customer.selected = false;
					return false;
				});
			} else if( value == "pClients" ) {
				filteredCustomers = filteredCustomers.filter(function(customer) {
					if( customer.type === null ) {
						return true;
					}
					customer.selected = false;
					return false;
				});
			} else if( filters[value].usesText && filterText ) {
				var filterRegexp = RegExp(filterText, "i");
				filteredCustomers = filteredCustomers.filter(function(customer) {
					if( filterRegexp.test(customer[filters[value].name]) ) {
						return true;
					}
					customer.selected = false;
					return false;
				});
			}
		});
		customers = filteredCustomers;

		// Sort the customers.
		customers = customers.sort(function(a, b) {
			var result = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0;
			if( sortReverse && result != 0 ) {
				return -result;
			}
			return result;
		});

		params.customers = customers;
		this.setState(params);
	},
	selectAllCustomers: function(selected) {
		customers = this.state.customers.map(function(customer) {
			customer.selected = selected;
			return customer;
		});
		this.setState({
			customers: customers,
			selectAll: selected,
		});
	},
	toggleSelectedCustomer: function(id, event) {
		customers = this.state.customers.map(function(customer) {
			if( customer.selected === undefined ) {
				customer.selected = false;
			}
			if( customer.id == id ) {
				customer.selected = !customer.selected;
			}
			return customer;
		});
		this.setState({
			customers: customers,
			selectAll: false,
		});
	},
	sortByField: function(key) {
		sortReverse = false;
		if( this.state.sortKey == key ) {
			sortReverse = !this.state.sortReverse;
		}
		this.updateCustomers({
			sortKey: key,
			sortReverse: sortReverse,
		});
	},
	filterFields: function(filters) {
		this.updateCustomers({
			selectAll: false,
			filters: filters,
		});
	},
	filterText: function(text) {
		this.updateCustomers({
			selectAll: false,
			filterText: text.length == 0 ? null : text,
		});
	},
	getInitialState: function() {
		return {
			customersAll: [],
			customers: [],
			validations: {},
			selectAll: false,
			sortKey: "name",
			sortReverse: false,
			filters: {},
			filterText: null,
		};
	},
	handleUpdateCustomer: function(customers) {
		reqwest({
			url: "/customer/update",
			method: "put",
			type: "json",
			data: {
				customers: customers,
			},
			success: function(data) {
				// FIXME: This seems terribly inefficient.
				var newCustomers = data.customers.map(function(customer) {
					// Ensure that all currently selected customers remain selected.
					this.state.customers.map(function(stateCustomer) {
						if( stateCustomer.id == customer.id ) {
							customer.selected = stateCustomer.selected;
						}
					});
					// Unselect all customers that were just updated.
					customers.map(function(updatedCustomer) {
						if( updatedCustomer.id == customer.id ) {
							customer.selected = false;
						}
					});
					return customer;
				}, this);

				this.updateCustomers({
					customersAll: newCustomers,
					validations: data.validations,
					selectAll: false,
				});
			}.bind(this),
			error: function(err) {
				console.log(err);
			}.bind(this),
		});
	},
	handleDeleteCustomer: function(customers) {
		reqwest({
			url: "/customer/delete",
			method: "delete",
			type: "json",
			data: {
				customers: customers,
			},
			success: function(data) {
				var newCustomers = data.customers.map(function(customer) {
					// Ensure that all currently selected customers remain selected.
					this.state.customers.map(function(stateCustomer) {
						if( stateCustomer.id == customer.id ) {
							customer.selected = stateCustomer.selected;
						}
					});
					return customer;
				}, this);

				this.updateCustomers({
					customersAll: data.customers,
					validations: data.validations,
					selectAll: false,
				});
			}.bind(this),
			error: function(err) {
				console.log(err);
			}.bind(this),
		});
	},
	componentDidMount: function() {
		reqwest({
			url: this.props.dataSource,
			method: "get",
			type: "json",
			success: function(data) {
				this.updateCustomers({
					customersAll: data.customers,
					validations: data.validations,
				});
			}.bind(this),
			error: function(err) {
				console.log(err);
			}.bind(this),
		});
	},
	render: function() {
		return (
			<div>
				<CustomerFilters filterFieldsChanged={this.filterFields} filterTextChanged={this.filterText} />
				<div className="row">
					<div className="small-12 columns">
						<table id="customer-list">
							<CustomerListHeader selectAll={this.state.selectAll} selectAllCustomers={this.selectAllCustomers} sortByField={this.sortByField} />
							<tbody>
								{this.state.customers.map(function(customer) {
									return <CustomerNode key={customer.id} customer={customer} validations={this.state.validations} toggleSelectedCustomer={this.toggleSelectedCustomer} updateCustomer={this.handleUpdateCustomer} deleteCustomer={this.handleDeleteCustomer} />;
								}.bind(this))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	},
});
