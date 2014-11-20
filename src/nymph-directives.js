(function(){

var mod = angular.module('NymphDirectives', []);

mod.directive('nymphForm', function(){
	return {
		restrict: 'EA',
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
		restrict: 'EA',
		transclude: true,
		scope: true,
		controller: ['$scope', '$attrs', function($scope, $attrs){
			$scope.pills = typeof $attrs.pills !== "undefined";
			$scope.stacked = typeof $attrs.stacked !== "undefined";
			$scope.justified = typeof $attrs.justified !== "undefined";

			var panes = $scope.panes = {};

			$scope.select = function(pane){
				if (pane.pane.disabled)
					return;
				angular.forEach(panes, function(pane){
					pane.pane.selected = false;
					pane.pane.open = false;
					if (pane.children.length) {
						angular.forEach(pane.children, function(pane){
							pane.selected = false;
						});
					}
				});
				pane.pane.selected = true;
				if (typeof pane.parent !== "undefined")
					pane.parent.pane.selected = true;
			};

			this.addPane = function(pane, parent){
				if (Object.keys(panes).length === 0) {
					pane.selected = true;
				}
				if (typeof parent !== "undefined") {
					if (typeof panes[parent] === "undefined")
						panes[parent] = {"id": parent, "pane": null, "children": [pane]};
					else
						panes[parent].children.push(pane);
				} else {
					if (typeof panes[pane.id] === "undefined")
						panes[pane.id] = {"id": pane.id, "pane": pane, "children": []};
					else {
						panes[pane.id].pane = pane;
						for (var k in panes[pane.id].children) {
							if (panes[pane.id].children[k].selected)
								panes[pane.id].pane.selected = true;
						}
					}
				}
			};
		}],
		template: '<div role="tabpanel" class="nymph-tabs">\
			<ul ng-class="{\'nav-tabs\': !pills, \'nav-pills\': pills, \'nav-stacked\': stacked, \'nav-justified\': justified}" class="nav" role="tablist">\
				<li role="presentation" ng-repeat="pane in panes | orderObjectBy:\'id\':false" ng-class="{active: pane.pane.selected, disabled: pane.pane.disabled, dropdown: pane.children.length, open: pane.pane.open}">\
					<a ng-if="!pane.children.length" role="tab" href="" ng-click="select(pane)">{{pane.pane.title}}</a>\
					<a ng-if="pane.children.length" class="dropdown-toggle" ng-click="pane.pane.open=!pane.pane.open" data-toggle="dropdown" href="" role="button" aria-expanded="false">{{pane.pane.title}} <span class="caret"></span></a>\
					<ul ng-if="pane.children.length" class="dropdown-menu" role="menu">\
						<li role="presentation" ng-repeat="child in pane.children" ng-class="{active: child.selected, disabled: child.disabled, divider: child.divider}">\
							<a ng-if="!child.divider" role="tab" href="" ng-click="select({parent:pane,pane:child})">{{child.title}}</a>\
						</li>\
					</ul>\
				</li>\
			</ul>\
			<div class="tab-content" ng-transclude></div>\
		</div>'
	};
}).directive('nymphPane', function(){
	// Also from https://docs.angularjs.org/guide/directive
	return {
		require: ['^^nymphTabs', '?^^nymphPane'],
		restrict: 'EA',
		transclude: true,
		scope: {
			title: '@',
			disabled: '=',
			divider: '='
		},
		controller: ['$scope', function($scope){
			$scope.id = "nymphtab-"+Math.floor((new Date()).getTime() +""+ Math.random() * 99999);
			this.paneID = $scope.id;
			this.isParent = function(){
				$scope.isParent = true;
			};
		}],
		link: function(scope, element, attrs, ctrls) {
			var tabsCtrl = ctrls[0], paneCtrl = ctrls[1];
			if (paneCtrl !== null) {
				tabsCtrl.addPane(scope, paneCtrl.paneID);
				paneCtrl.isParent();
			} else {
				tabsCtrl.addPane(scope);
			}
		},
		template: '<div ng-class="{\'tab-pane\': !isParent}" role="tabpanel" ng-show="selected" ng-transclude></div>'
	};
}).directive('nymphTitle', function(){
	return {
		restrict: 'EA',
		transclude: true,
		scope: {
			elem: '='
		},
		template: '<div class="page-header nymph-title"><h1 ng-if="!elem||elem==\'h1\'" ng-transclude></h1><h2 ng-if="elem==\'h2\'" ng-transclude></h2><h3 ng-if="elem==\'h3\'" ng-transclude></h3><h4 ng-if="elem==\'h4\'" ng-transclude></h4><h5 ng-if="elem==\'h5\'" ng-transclude></h5><h6 ng-if="elem==\'h6\'" ng-transclude></h6><div ng-if="elem==\'div\'" ng-transclude></div></div>'
	};
}).directive('nymphInput', ['$compile', function($compile){
	return {
		require: '?^^nymphForm',
		restrict: 'EA',
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
}).filter('orderObjectBy', function(){
	// taken from http://justinklemm.com/angularjs-filter-ordering-objects-ngrepeat/
	return function(items, field, reverse){
		var filtered = [];
		angular.forEach(items, function(item){
			filtered.push(item);
		});
		filtered.sort(function(a, b){
			return (a[field] > b[field] ? 1 : -1);
		});
		if (reverse)
			filtered.reverse();
		return filtered;
	};
});

})();
