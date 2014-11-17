// This file is a demo class that extends the Entity class.
// Uses AMD or browser globals.
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as a module.
        define('NymphEmployee', ['NymphEntity'], factory);
    } else {
        // Browser globals
        factory(Entity);
    }
}(function(Entity){
	Employee = function(id){
		this.constructor.call(this, id);
		this.addTag('employee');
		this.data.current = true;
		this.data.start_date = Math.floor(new Date().getTime() / 1000);
		this.data.subordinates = [];
		this.start_date = this.start_date.bind(this);
		this.end_date = this.end_date.bind(this);
	};
	Employee.prototype = new Entity();

	var thisClass = {
		// === The Name of the Class ===
		class: 'Employee',

		// === Class Variables ===
		etype: "employee",
		storeStartDate: null,
		storeEndDate: null,

		// === Class Methods ===
		start_date: function(date){
			if (angular.isDefined(date)) {
				this.storeStartDate = date;
				this.data.start_date = Math.floor(date.getTime() / 1000);
			}
			if (this.storeStartDate === null && this.data.start_date)
				this.storeStartDate = new Date(this.data.start_date * 1000);
			return this.storeStartDate;
		},
		end_date: function(date){
			if (angular.isDefined(date)) {
				this.storeEndDate = date;
				this.data.end_date = Math.floor(date.getTime() / 1000);
			}
			if (this.storeEndDate === null && this.data.end_date)
				this.storeEndDate = new Date(this.data.end_date * 1000);
			return this.storeEndDate;
		}
	};
	for (var p in thisClass) {
		Employee.prototype[p] = thisClass[p];
	}

	return Employee;
}));
