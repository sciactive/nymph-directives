angular.module('exampleApp', ['NymphDirectives']).controller('ExampleController', ['$scope', function($scope) {
	$scope.uiState = {
		employees: []
	};
	$scope.entity = new Employee();

	Nymph.getEntities({class: "Employee"}, {type: '&', tag: 'employee'}).then(function(employees){
		if (employees && employees.length) {
			Nymph.sort(employees, 'id');
			$scope.uiState.employees = employees;
			$scope.$apply();
		}
	});

	$scope.checkNew = function(){
		if ($scope.entity === null)
			$scope.entity = new Employee();
	};
}]);
