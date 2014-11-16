(function(){

var mod = angular.module('NymphDirectives', []);

mod.directive('nymphForm', function(){
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			entity: '='
		},
		controller: ['$scope', '$attrs', function($scope, $attrs){
			$scope.autosave = typeof $attrs.autosave !== "undefined";
			$scope.horizontal = typeof $attrs.horizontal !== "undefined";
			$scope.inline = typeof $attrs.inline !== "undefined";

			this.type = function(){
				if ($scope.horizontal) {
					return 'horizontal';
				} else if ($scope.inline) {
					return 'inline';
				} else {
					return 'default';
				}
			};

			this.autosave = function(){
				return $scope.autosave;
			};

			this.entity = function(){
				return $scope.entity;
			};
		}],
		template: '<form class="nymph-form" ng-class="{\'form-horizontal\': horizontal, \'form-inline\': inline}" ng-transclude></form>'
	};
}).directive('nymphTabs', function(){
	// Shamelessly ripped from https://docs.angularjs.org/guide/directive
	return {
		restrict: 'E',
		transclude: true,
		scope: true,
		controller: ['$scope', '$attrs', function($scope, $attrs){
			$scope.pills = typeof $attrs.pills !== "undefined";
			$scope.stacked = typeof $attrs.stacked !== "undefined";
			$scope.justified = typeof $attrs.justified !== "undefined";

			var panes = $scope.panes = [];

			$scope.select = function(pane) {
				if (pane.disabled)
					return;
				angular.forEach(panes, function(pane) {
					pane.selected = false;
				});
				pane.selected = true;
			};

			this.addPane = function(pane) {
				if (panes.length === 0) {
					$scope.select(pane);
				}
				panes.push(pane);
			};
		}],
		template: '<div role="tabpanel" class="nymph-tabs"><ul ng-class="{\'nav-tabs\': !pills, \'nav-pills\': pills, \'nav-stacked\': stacked, \'nav-justified\': justified}" class="nav" role="tablist"><li role="presentation" ng-repeat="pane in panes" ng-class="{active: pane.selected, disabled: pane.disabled}"><a role="tab" href="" ng-click="select(pane)">{{pane.title}}</a></li></ul><div class="tab-content" ng-transclude></div></div>'
	};
}).directive('nymphPane', function(){
	// Also from https://docs.angularjs.org/guide/directive
	return {
		require: '^^nymphTabs',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@',
			disabled: '='
		},
		link: function(scope, element, attrs, tabsCtrl) {
			tabsCtrl.addPane(scope);
		},
		template: '<div role="tabpanel" class="tab-pane" ng-show="selected" ng-transclude></div>'
	};
}).directive('nymphTitle', function(){
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			elem: '='
		},
		template: '<div class="page-header nymph-title"><h1 ng-if="!elem||elem==\'h1\'" ng-transclude></h1><h2 ng-if="elem==\'h2\'" ng-transclude></h2><h3 ng-if="elem==\'h3\'" ng-transclude></h3><h4 ng-if="elem==\'h4\'" ng-transclude></h4><h5 ng-if="elem==\'h5\'" ng-transclude></h5><h6 ng-if="elem==\'h6\'" ng-transclude></h6><div ng-if="elem==\'div\'" ng-transclude></div></div>'
	};
}).directive('nymphInput', ['$compile', function($compile){
	return {
		require: '?^^nymphForm',
		restrict: 'E',
		priority: 2,
		transclude: false,
		scope: false,
		link: function(scope, element, attrs, nymphForm){
			var template, inputType,
				hasSuccess = element.hasClass('has-success'),
				hasWarning = element.hasClass('has-warning'),
				hasError = element.hasClass('has-error'),
				formType = typeof nymphForm === "undefined" ? 'default' : nymphForm.type(),
				uniqid = "nymphid-"+Math.floor(Math.random() * 9999999999999),
				note = element.find('nymph-note'), noteHTML;

			if (note.length) {
				noteHTML = '<span class="help-block nymph-note">'+note.children().html()+'</span>';
				note.empty();
			} else {
				noteHTML = '';
			}

			var contents = element.html();

			switch (attrs.type) {
				default:
					switch (formType) {
						case 'default':
							template = '<div class="form-group"><label for="'+uniqid+'">'+contents+'</label><input type="'+attrs.type+'" class="form-control" id="'+uniqid+'" ng-model="'+attrs.model+'">'+noteHTML+'</div>';
							break;
						case 'horizontal':
							template = '<div class="form-group"><label for="'+uniqid+'" class="col-sm-2 control-label">'+contents+'</label><div class="col-sm-10"><input type="'+attrs.type+'" class="form-control" id="'+uniqid+'" ng-model="'+attrs.model+'">'+noteHTML+'</div></div>';
							break;
						case 'inline':
							template = '<div class="form-group"><div class="input-group"><label class="sr-only" for="'+uniqid+'">'+contents+'</label><input type="'+attrs.type+'" class="form-control" id="'+uniqid+'" ng-model="'+attrs.model+'">'+noteHTML+'</div></div>';
							break;
					}
					inputType = 'input';
					break;
				case 'checkbox':
					switch (formType) {
						case 'default':
							template = '<div class="checkbox"><label><input type="checkbox" ng-model="'+attrs.model+'"> '+contents+'</label></div>';
							break;
						case 'horizontal':
							template = '<div class="form-group"><div class="col-sm-offset-2 col-sm-10"><div class="checkbox"><label><input type="checkbox" ng-model="'+attrs.model+'"> '+contents+'</label></div></div></div>';
							break;
						case 'inline':
							template = '<div class="checkbox"><label><input type="checkbox" ng-model="'+attrs.model+'"> '+contents+'</label></div>';
							break;
					}
					inputType = 'input';
					break;
				case 'static':
					switch (formType) {
						case 'default':
							template = '<div class="form-group"><label for="'+uniqid+'">'+contents+'</label><p class="form-control-static">{{'+attrs.model+'}}</p>'+noteHTML+'</div>';
							break;
						case 'horizontal':
							template = '<div class="form-group"><label for="'+uniqid+'" class="col-sm-2 control-label">'+contents+'</label><div class="col-sm-10"><p class="form-control-static">{{'+attrs.model+'}}</p>'+noteHTML+'</div></div>';
							break;
						case 'inline':
							template = '<div class="form-group"><div class="input-group"><label class="sr-only" for="'+uniqid+'">'+contents+'</label><p class="form-control-static">{{'+attrs.model+'}}</p>'+noteHTML+'</div></div>';
							break;
					}
					inputType = 'p';
					break;
			}
			element.empty().append(angular.element(template));

			if (hasSuccess)
				element.children().addClass("has-success");
			if (hasWarning)
				element.children().addClass("has-warning");
			if (hasError)
				element.children().addClass("has-error");

			var input = element.find(inputType);
			if (attrs.class)
				input.addClass(attrs.class);
			angular.forEach(attrs, function(val, name){
				if (['model', 'type', 'class'].indexOf(name) !== -1 || name[0] === '$')
					return;
				input.attr(name, val);
			});
			$compile(element.contents())(scope);
		}
	};
}]).directive('nymphNote', function(){
	return {
		restrict: 'E',
		transclude: true,
		scope: true,
		priority: 1,
		template: '<span class="help-block nymph-note" ng-transclude></span>'
	};
});

})();
