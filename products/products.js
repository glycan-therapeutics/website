var app = angular.module('Compounds', ['ui.router', 'ui.bootstrap']);

app.config(function($stateProvider, $locationProvider){
  $locationProvider.html5Mode(true);   
  var indexState = {
  	name: 'index',
  	url: '/',
  	templateUrl: '/home.html'
  }

  var productIndexState = {
  	name: 'products',
  	url: '/products/',
 	templateUrl: '/products/products-home.html'
  }

  var productState = {
  	name: 'products.compounds',
  	parent: productIndexState,
  	url: 'compounds',
  	templateUrl: '/products/products.html'
  }

  var serviceState = {
  	name: "services",
  	url: '/services/',
  	templateUrl: '/services/services.html'
  }

  var researchState = {
  	name: "research",
  	url: '/research/',
  	templateUrl: '/research/research.html'
  }

  var supportState = {
  	name: "support",
  	url: '/support/',
  	templateUrl: '/support/support.html'
  }

  var aboutUsState = {
  	name: 'about-us',
  	url: '/support/about-us',
  	templateUrl: '/support/about_us.html'
  }

  var contactState = {
  	name: 'contact-us',
  	url: '/support/contact-us',
  	templateUrl: '/support/contact_us.html'
  }

  var distributorState = {
  	name: 'distributors',
  	url: '/products/distributor-list',
  	templateUrl: '/products/distributor-list.html'
  }
  $stateProvider.state(indexState);
  $stateProvider.state(productIndexState);
  $stateProvider.state(productState);
  $stateProvider.state(serviceState);
  $stateProvider.state(researchState);
  $stateProvider.state(supportState);
  $stateProvider.state(aboutUsState);
  $stateProvider.state(contactState);
  $stateProvider.state(distributorState);
});

app.controller('compoundCtrl', function($location, $scope, $sce, $http, $uibModal, $log, $document){
	$http.get("/products/compounds.php")
	.then(function (response) {
		$scope.compounds = response.data.records;
	});

	var $ctrl = this;
	$ctrl.items = ['adfkdfk', 'badsfadf', 'cwerere'];

	$ctrl.open = function(size, parentSelector) {
		var parentElem = parentSelector ? angular.element($document[0].querySelector('.cart-modal' + parentSelector)) : undefined;
		var modalInstance = $uibModal.open({
			animation: true,
			ariaLabelledBy: 'modal-title',
			ariaDescribedBy: 'modal-body',
			templateUrl: 'cartModal.html',
			controllerAs: '$ctrl',
			size: size,
			appendTo: parentElem,
			resolve: {
				items: function() {
					return $ctrl.items;
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			$ctrl.selected = selectedItem;
		});
	};

	$scope.distributor = {
		title: "Distributors"
	};

	$scope.options = [{
		value: '1',
		label: '100 ug'
	}, {
		value: '5',
		label: '500 ug'
	}, {
		value: '10',
		label: '1 mg'
	}];

	$scope.seriesName = [
		'NA',
		'NS',
		'NS-NA',
		'6S',
		'2S',
		'2S-6S',
		'3S'
	];

	$scope.sizeName = [
		'4-Mer',
		'5-Mer',
		'6-Mer',
		'7-Mer',
		'8-Mer',
		'9-Mer'
	];

	$scope.tagName = [
		'pNP',
		'Azido',
		'Biotin'
	];

	var search = $location.search();
	$scope.seriesFilter = search.series;
	$scope.tagFilter = search.tag;
	$scope.sizeFilter = search.size;
	$scope.selectedIndex = undefined;

	$scope.filterBy = function(x) {
		$scope.nameFilter = x; 
	}
	$scope.filterUrl = function(x, filter) {
		if(x === $scope.seriesFilter) {
			$scope.seriesFilter = '';
		}
		else if(x === $scope.tagFilter) {
			$scope.tagFilter = '';
		}
		else if(x === $scope.sizeFilter) {
			$scope.sizeFilter = '';
		}
		else {
			switch(filter) {
				case 'series':
					$scope.seriesFilter = x;
					break;
				case 'tag':
					$scope.tagFilter = x;
					break;
				case 'size':
					$scope.sizeFilter = x;
			}
		}
		$location.search({series: $scope.seriesFilter, size: $scope.sizeFilter, tag: $scope.tagFilter});
	}
	$scope.hide = function(x) {
		if(x === '')
			return true;
		else 
			return false;
	}
	$scope.availablity = function(x) {
		if(x === '#')
			return false;
		else if(x === '')
			return false;
		else
			return true;
	}
	$scope.noPrice = function(x) {
		if(x === '0') 
			return true;
		else
			return false;
	}
	$scope.displayPrice = function(price, multiplier, tag) {
		price = Number(price);
		multiplier = Number(multiplier);
		if(multiplier === 5) {
			if(price > 40) {
				if(tag === "pNP")
					price = price * multiplier * .65;				
				else 
					price = price * multiplier * .7;
			}
			else
				price = price * multiplier;
		}
		else if(multiplier === 10) {
			if(price > 40) {
				if(tag === "pNP")
					price = price * multiplier * .52;
				else
					price = price * multiplier * .6;
			}
			else
				price = price * multiplier;
		}

		$scope.price = price;
		return price.toFixed(2);
	}
	$scope.isPNP = function(family) {
		if(family === "pNP")
			return true;
		else if(family === "Biotin")
			return true;
		else
			return false;
	}
	$scope.changeGlyph = function(index) {
		if($scope.selectedIndex == undefined)
			$scope.selectedIndex = index;
		else
			$scope.selectedIndex = undefined;
	}
});
