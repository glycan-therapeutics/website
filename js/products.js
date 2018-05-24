var app = angular.module('Compounds', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'ngSanitize', 'ngHtmlCompile','ngAria','ngMaterial']);


app.directive('updateTitle', ['$rootScope', '$timeout',
	function($rootScope, $timeout) {
		return {
			link: function(scope, element) {
				var listener = function(event, toState) {
					var webTitle = 'Innovative Carbohydrate Solutions - Glycan Therapeutics';
					if(toState.data && toState.data.pageTitle)
						webTitle = toState.data.pageTitle;
					$timeout(function() {
						element.text(webTitle);
					}, 0, false);
				}
				$rootScope.$on('$stateChangeSuccess', listener);
			}
		}
	}
]);

app.controller('init', function($rootScope, $scope, $uibModal, $document, $http) {
	$http.get("/glycanapi.php/news")
	.then(function(response) {
		$scope.news = response.data;
	});
	$scope.slides = [{
		id: 0,
		title: "18-Mer Library",
		text: "Pushing the boundaries of conventional heparan sulfates.",
		img: '/images/placeholder.jpg',
		color: 'black',
		state: 'products.limited',
		link: '/products/18-mer-library'
	}, {
		id: 1,
		title: "High Throughput Microarray Screening for Heparan Sulfate libraries",
		text: "Image - raw data of our 52 library. Learn how to utilize our new service today.",
		img: "/images/micro-array-banner-2.jpg",
		color: 'white',
		state: "services.analysis",
		link: '/services/microarray-analysis'
	}, {
		id: 2,
		title: "Innovative solutions for carbohydrate medicines.",
		text: "Click to find out more.",
		img: "/images/Heparin_CoverArt.jpg",
		color: 'black',
		state: "about-us",
		link: '/support/about-us'
	}];
	$scope.active = 0;
	$scope.isCollapsed = true;
	$scope.productCollapsed = true;
	$scope.serviceCollapsed = true;
	$rootScope.$on('$stateChangeSuccess', function() {
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		for(var x in $scope.compounds) {
			$scope.compounds[x]['isCollapsed'] = true;
		}
	});

	$scope.nextSlide = function() {
		if($scope.active === $scope.slides.length-1)
			$scope.active = 0;
		else
			$scope.active = $scope.active + 1;
		console.log($scope.active);
	}
	$scope.prevSlide = function() {
		if($scope.active === 0)
			$scope.active = $scope.slides.length-1;
		else
			$scope.active = $scope.active - 1;
		console.log($scope.active)
	}

   $scope.openModal = function(image) {
   	$scope.image = image;
   	var description = [{
   		title: 'Fig. 1',
   		body: 'Schematic presentation of HS microarray analysis.'
   	}, {
   		title: 'Fig. 2. Images of HS-array analysis.',
   		body: 'Panel A shows the image of the array slide hybridized with fluorescently labeled 3-OST-1.  A total of 14 oligosaccharides were affixed on the slide, and each compound was spotted to 100 spots.  The histogram of fluorescence intensity analysis is shown on the right. The local background of the fluorescence value was to 106 ± 10. Panel B shows the image of the array slide hybridized with fluorescently labeled AT. The local background of the fluorescence value was 60 ± 3. The histogram of fluorescence intensity analysis is shown on the right.  Both 3-OST-1 and AT were labeled with Alexa Fluo® 488.  The symbolic structures of 14 heptasaccharides are shown on top of the figure. The images were acquired using the excitation wavelength of 488 nm on a GenePix 4300 A scanner.'
   	}, {
   		title: 'Fig. 3',
   		body: 'HS microarray analysis of the bindings of HS and platelet factor 4 (PF4), fibroblast growth factor 2 (FGF2), and antithrombin (AT). A total of 52 HS oligosaccharides and heparin were printed on microarray chips. The chip was hybridized with Alexa 488-labeled PF4, Alexa 488-labeled FGF2, and Alexa 488-labeled AT. The abbreviated oligosaccharide sequences for each sample are listed. For each sample, 36 spots were printed. Thus, the data presented as mean ± S.D. (n=36).'
   	}];

   	if(image === '/images/micro-analysis.fig1.jpg') {
   		$scope.figureDescription = description[0].body;
   		$scope.figureTitle = description[0].title;
   	}
   	else if(image === '/images/micro-analysis.fig2.jpg') {
   		$scope.figureDescription = description[1].body;
   		$scope.figureTitle = description[1].title;
   	}
   	else if(image === '/images/micro-analysis.fig3.jpg') {
   		$scope.figureDescription = description[2].body;
   		$scope.figureDescription = description[2].title;
   	}

   	$('#myModal').modal();
   }
});

app.controller('ModalInstanceCtrl', function ($uibModalInstance, items) {
	var $ctrl = this;

	$ctrl.cancel = function () {
    	$uibModalInstance.dismiss('cancel');
  	};
});

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('');
}]);

app.config(function($stateProvider, $urlRouterProvider) {
  var indexState = {
  	name: 'index',
  	url: '/',
  	templateUrl: '/home.html',
  };

  var newsIndexState = {
  	name: 'news',
  	url: '/news/',
  	templateUrl: '/news/news-home.html',
  	data: {
  		pageTitle: 'All News - Glycan Therapeutics'
  	}
  };

  var newsState = {
  	name: 'news.detailed',
  	parent: newsIndexState,
  	url: ':newsId',
  	templateUrl: function($stateParams) {
  		return '/news/' + $stateParams.newsId + '.html';
  	},
  	data: {
  		pageTitle: 'News - Glycan Therapeutics'
  	}
  };

  var productIndexState = {
  	name: 'products',
  	url: '/products/',
 	templateUrl: '/products/products-home.html',
 	data: {
 		pageTitle: 'All Products - Glycan Therapeutics'
 	}
  };

  var productState = {
  	name: 'products.compounds',
  	parent: productIndexState,
  	url: 'compounds?series&size&tag&date',
  	templateUrl: '/products/products.html',
  	controller: function($stateParams, $scope) {
  		$scope.seriesFilter = $stateParams.series;
  		$scope.sizeFilter = $stateParams.size;
  		$scope.tagFilter = $stateParams.tag;
  		$scope.dateFilter = $stateParams.date;
  	}, 
  	data: {
  		pageTitle: 'Compounds - Glycan Therapeutics'
  	}
  };

  var limitedProductState = {
  	name: 'products.limited',
  	parent: productIndexState,
  	url: '18-mer-library',
  	templateUrl: '/products/limited.html',
  	data: {
  		pageTitle: '18-mer Library - Limited - Glycan Therapeutics'
  	}
  }

  var serviceState = {
  	name: "services",
  	url: '/services/',
  	templateUrl: '/services/services.html',
  	data: {
  		pageTitle: 'All Services - Glycan Therapeutics'
  	}
  };

  var analysisState = {
  	name: "services.analysis",
  	parent: serviceState,
  	url: 'microarray-analysis',
  	templateUrl: '/services/micro-array.html',
  	data: {
  		pageTitle: "Microarray Analysis - Glycan Therapeutics"
  	}
  };

  var synthesisState = {
  	name: "services.synthesis",
  	parent: serviceState,
  	url: 'custom-synthesis',
  	templateUrl: '/services/custom-synthesis.html',
  	data: {
  		pageTitle: 'Custom Synthesis - Glycan Therapeutics'
  	}
  };

  var researchState = {
  	name: "research",
  	url: '/research/',
  	templateUrl: '/research/research.html',
  	data: {
  		pageTitle: 'Research - Glycan Therapeutics'
  	}
  };

  var supportState = {
  	name: "support",
  	url: '/support/',
  	templateUrl: '/support/support.html',
  	data: {
  		pageTitle: 'Support - Glycan Therapeutics'
  	}
  };

  var aboutUsState = {
  	name: 'about-us',
  	url: '/support/about-us',
  	templateUrl: '/support/about_us.html',
  	data: {
  		pageTitle: 'About Us - Glycan Therapeutics'
  	}
  };

  var contactState = {
  	name: 'contact-us',
  	url: '/support/contact-us',
  	templateUrl: '/support/contact_us.html',
  	data: {
  		pageTitle: 'Contact Us - Glycan Therapeutics'
  	}
  };

  var privacyState = {
  	name: 'privacy',
  	url: '/support/privacy-policy',
  	templateUrl: '/support/privacy-policy.html',
  	data: {
  		pageTitle: 'Privacy Policy - Glycan Therapeutics'
  	}
  };

  var termsState = {
  	name: 'terms',
  	url: '/support/terms-conditions',
  	templateUrl: '/support/terms-conditions.html',
  	data: {
  		pageTitle: 'Terms & Conditions - Glycan Therapeutics'
  	}
  };

  var demoState = {
  	name: 'demo',
  	url: '/compound-builder',
  	templateUrl: '/services/synthetic-demo.html',
  	controller: function($stateParams, $scope) {
  		$scope.structure = [];
  	},
  	data: {
  		pageTitle: 'Online Synthesis - Glycan Therapeutics'
  	}
  };

  $stateProvider.state(indexState);
  $stateProvider.state(productIndexState);
  $stateProvider.state(productState);
  $stateProvider.state(limitedProductState)
  $stateProvider.state(serviceState);
  $stateProvider.state(analysisState);
  $stateProvider.state(synthesisState);
  $stateProvider.state(researchState);
  $stateProvider.state(supportState);
  $stateProvider.state(aboutUsState);
  $stateProvider.state(contactState);
  $stateProvider.state(newsIndexState);
  $stateProvider.state(newsState);
  $stateProvider.state(privacyState);
  $stateProvider.state(termsState);
  $stateProvider.state(demoState);
});

app.factory('GlcNAc6SRules', function() {
	return function(structure, position) { //to check if any GlcNAc has been selected; if so then disable
		var bool = false;
		for(var x in structure) {
			if(structure[x] === "GlcNS" || structure[x] === "GlcNAc") {
				bool = true;
				break;
			}
			else
				bool = false;
		}
		return bool;
	}
});

app.factory('GlcNS6SRules', function() {
	return function(structure, position) { //to check if any GlcNS has been selected; if so then disable
		var bool = false;
		for(var x in structure) {
			if(structure[x] === "GlcNS" && x > 3 || structure[x] === "GlcNAc") {
				bool = true;
				break;
			}
			else
				bool = false;
		}
		return bool;
	}
});

app.factory('Ido2SRules', function() {
	return function(structure, position) {
		var bool = false;
		for(var x in structure) {
			if(structure[x] === "IdoA") {
				bool = true;
			}
			else if(x > 4 && structure[x] === 'GlcA') {
				bool = true;
			}
			else if(structure[x] === "GlcA2S") {
				bool = true;
			}
		}
		return bool;
	}
});

app.controller('synthesisCtrl', ['$scope', 'GlcNAc6SRules', 'GlcNS6SRules', 'Ido2SRules', '$sce', function($scope, NA6S, NS6S, Ido2S, $sce) {

	$scope.minSize = 4;
	$scope.maxSize = 10;


	//store different tag possibilites in JSON
	$scope.tags = [{
		name: 'pNP',
		tooltip: '310nm Abs for easy UV detection.'
	}, {
		name: 'Azido',
		tooltip: 'Compatible with click chemistry.'
	}, {
		name: 'Biotin',
		tooltip: 'Affinity tag for detection & purification.'
	}, {
		name: 'Fluorescein',
		tooltip: 'Fluorescein detection.'
	}];

	//store odd pieces in JSON
	$scope.oddPiece = [{
		name: 'GlcA',
		tooltip: 'Can be linked to any piece.'
	}, {
		name: 'GlcA2S',
		tooltip: 'Selecting it gives you the ability to make the first GlcA into a GlcA2S.'
	}, {
		name: 'IdoA',
		tooltip: 'Can only be selected at the 3rd position of the compound.'
	}, {
		name: 'IdoA2S',
		tooltip: 'If immediately linked to GlcNS6S, then GlcNS6S3S will be available.'
	}];

	//store even pieces in JSON
	$scope.evenPiece = [{
		name: 'GlcNAc',
		tooltip: 'Can only be linked to GlcA. Disables any 6S molecules if selected.'
	}, {
		name: 'GlcNAc6S',
		tooltip: 'Can only be linked to GlcA.'
	}, {
		name: 'GlcNS',
		tooltip: 'Can be linked to GlcA, GlcA2S, IdoA, and IdoA2S. Disables any 6S molecules if selected.'
	}, {
		name: 'GlcNS6S',
		tooltip: 'Can be linked to GlcA, GlcA2S, IdoA, and IdoA2S. Required to get GlcNS6S3S.'
	}, {
		name: 'GlcNS6S3S',
		tooltip: "Only one GlcNS6S3S can be added to the structure and has to be linked to GlcA after being selected."
	}];

	//initialization
	$scope.structure = [];
	$scope.highestSeries = "";
	$scope.continue = true;
	$scope.tag = "";
	$scope.baseSize = 0;
	var moreGlcA2S = false;

	$scope.getHistory = function() {
		$scope.history = [];
		for(var x=0; x<localStorage.getItem("historyLength"); x++) {
			if(localStorage.getItem(x+1) != null) {
				$scope.history.push({"key": x+1, "compound": localStorage.getItem(x+1)});
			}
		}
	};

	$scope.removeHistory = function(index, key) {
		$scope.history.splice(index, 1);
		localStorage.removeItem(key);
	}

	$scope.loadHistory = function(compound) {
		var structure = compound;
		var split = structure.split('-');
		$scope.size = 0;
		$scope.continue = false;
		$scope.structure = [];

		if(split[split.length - 1] === 'Fluorescein')
			$scope.baseSize = split.length - 2; 
		else
			$scope.baseSize = split.length - 1;

		for(var i=split.length-1; i >= 0; i--) {
			if(split[i] != 'pA')
				$scope.structure.push(split[i]);
			if(i === split.length-1)
				$scope.tag = split[i];
		}

		$('#myHistory').modal('toggle');
	}

	$scope.openHistory = function() {
		$scope.getHistory();
		$('#myHistory').modal();
   	}

   	$scope.exportData = function() {
		alasql('SELECT compound INTO XLSX("my_compounds.xlsx",{headers:false}) FROM ?', [$scope.history]);
	}

   	$scope.dismiss = function() {
   		$scope.alert = false;
   	}

	$scope.saveCompound = function(compound) {
		var size;
		if($scope.structure.length > $scope.minSize) {
			if(localStorage.getItem("historyLength") === null) {
				size = 1;
				localStorage.setItem("historyLength", size);

			} 
			else {
				size = localStorage.getItem("historyLength");
				size++;
				localStorage.setItem("historyLength", size);
			}

			localStorage.setItem(size, compound);
			console.log(localStorage.getItem("historyLength"));
			$scope.openHistory();
		}
		else
			$scope.alert = true;
	};

	$scope.arrayBack = function() {
		if($scope.structure.length > 0) {
			if($scope.baseSize % 2 != 0 && $scope.size === 0) {
				$scope.structure.splice($scope.baseSize-1, 2);
				$scope.size += 2;
				$scope.continue = true;
			}
			else {
				$scope.structure.pop();
				$scope.size++;
			    $scope.continue = true;
			}
		}
		$scope.highestSeries = '';
	}

	$scope.structureDisplay = function() { //to give the list of similar compounds
		var structure = "";
		$scope.highestSeries = "";
		for(x in $scope.structure) {
			switch($scope.structure[x]) {
				case 'GlcNS6S3S':
					$scope.highestSeries = '3S';
					break;
				case 'GlcA2S':
					$scope.highestSeries = 'GlcA2S';
					break;
				case 'IdoA':
					if($scope.highestSeries != '3S')
						$scope.highestSeries = 'IdoA';
				    break;
				case 'IdoA2S':
					if($scope.highestSeries != '3S' && $scope.highestSeries != 'IdoA' && $scope.highestSeries != 'GlcA2S') {
						if($scope.highestSeries === '6S' || $scope.highestSeries === '2S-6S')
							$scope.highestSeries = '2S-6S';
						else
							$scope.highestSeries = '2S';
					}
					break;
				case 'GlcNS6S':
				case 'GlcNAc6S':
					if($scope.highestSeries != '3S' && $scope.highestSeries != 'IdoA' && $scope.highestSeries != 'GlcA2S') {
						if($scope.highestSeries === '2S' || $scope.highestSeries === '2S-6S')
							$scope.highestSeries = '2S-6S';
						else
							$scope.highestSeries = '6S';
					}
					break;
				case 'GlcNS':
					if($scope.highestSeries != '3S' && $scope.highestSeries != 'IdoA' && $scope.highestSeries != 'GlcA2S' && $scope.highestSeries != '2S-6S' && $scope.highestSeries != '2S' && $scope.highestSeries != '6S') {
						if($scope.highestSeries === 'NA' || $scope.highestSeries === 'NS-NA')
							$scope.highestSeries = 'NS-NA';
						else 
							$scope.highestSeries = 'NS';
					}
					break;
				case 'GlcNAc':
					if($scope.highestSeries != '3S' && $scope.highestSeries != 'IdoA' && $scope.highestSeries != 'GlcA2S' && $scope.highestSeries != '2S-6S' && $scope.highestSeries != '2S' && $scope.highestSeries != '6S') {
						if($scope.highestSeries === 'NS' || $scope.highestSeries === 'NS-NA')
							$scope.highestSeries = 'NS-NA';
						else
							$scope.highestSeries = 'NA';
					}
					break;
				default:
					break;
			}
			if(x < 1) {
				if($scope.structure[x] === 'Fluorescein'){
					structure = 'pA-' + $scope.structure[x] + structure;
				}
				else
					structure = $scope.structure[x] + structure;
			}
			else
				structure = $scope.structure[x] + "-" + structure;
		}
		return structure;
	}

	$scope.setTag = function(tag) {
		if($scope.structure[0] === undefined) {
			$scope.tag = tag;
			$scope.structure.push(tag);
		}
		else {
			$scope.tag = tag;
			$scope.structure[0] = tag;
 		}
	}

	$scope.addPiece = function(molecule, position) {
		if($scope.structure.length === 3 && molecule === "GlcA2S") {
			var choice = confirm("Do you wish to change the first GlcA to GlcA2S? (This will allow more than one GlcA2S to be added.)");
			if(choice) {
				moreGlcA2S = true;
				$scope.structure[$scope.structure.length - 2] = 'GlcA2S';
				$scope.structure[$scope.structure.length - 1] = 'GlcNS';
			}
		}

		if(molecule === "GlcNAc") {
			moreGlcA2S = false;
		}

		$scope.structure.push(molecule);
	}

	$scope.oddRules = function(position, piece) {
		var bool = true;
		if(piece === 'GlcA') {
			bool = false;
		}
		if(position < $scope.maxSize - 1) {
			switch(piece) {
				case 'GlcA':
					bool = false;
					break;
				case 'GlcA2S':
					if($scope.structure[position - 1] != "GlcNS6S3S" && $scope.structure[position - 1] === "GlcNS")	{
						if(position === 3) {
							bool = false;
						}		
						if(moreGlcA2S) {
							bool = false;
						}
					}
					break;
				case 'IdoA':
					if(position === 3) {
						if($scope.structure[position - 1] != "GlcNS6S3S" && $scope.structure[position - 1] === "GlcNS" || $scope.structure[position - 1] === "GlcNS6S")
							bool = false;
					}
					break;
				case 'IdoA2S':
					if($scope.structure[position - 1] != "GlcNS6S3S" && $scope.structure[position - 1] === "GlcNS" || $scope.structure[position - 1] === "GlcNS6S")
						bool = Ido2S($scope.structure, position);
					break;
			}
		}
		return bool;
	}

	$scope.evenRules = function(position, piece) { //disable if true
		var bool = true;
		switch(piece) {
			case 'GlcNAc':
				if($scope.structure[position - 1] === "GlcA")
					bool = false;
				break;
			case 'GlcNAc6S':
				if($scope.structure[position - 1] === "GlcA")
					bool = NA6S($scope.structure, position);
				break;
			case 'GlcNS':
				bool = false;
				break;
			case 'GlcNS6S':
				bool = NS6S($scope.structure, position);
				break;
			case 'GlcNS6S3S':
				if($scope.structure[position - 1] === 'IdoA2S')
					bool = NS6S($scope.structure, position);
				break;
		}
		return bool;
	}

	$scope.isEven = function(length) {
		var bool;
		if(length > 0) {
			if(length % 2 === 0)
				bool = true;
			else {
				bool = false;
			}
		}
		return bool;
	}

		var self = this;
		self.determinateValue = 100;
		
		$scope.increment= function(){
		 self.determinateValue -=11.1;
		}
		
		$scope.decrement= function(){
			if(self.determinateValue<100){
			self.determinateValue +=11.1;
		}
		   }
   
 
}]);

app.controller('limitedCtrl', function($location, $scope, $sce, $http, $uibModal, $log, $document, $state) {
	$http.get("/glycanapi.php/library18")
	.then(function(response) {
		$scope.limited = response.data;
		for(var x in $scope.limited)
			$scope.limited[x]['isOpen'] = false;
	});
	$scope.tabs = [
		'Azido',
		'Biotin'
	];
	$scope.selectedTag = 'Biotin';	

	checkPrice = function() {
		if($scope.selectedTag==='Azido')
			$scope.currentPrice = Number($scope.limited[$scope.index].Price100);
		else if($scope.selectedTag==='Biotin')
			$scope.currentPrice = Number($scope.limited[$scope.index].Price100) + 200;
	}

	$scope.selectTag = function(tag) {
		$scope.selectedTag = tag;
		checkPrice();
	}

	$scope.openLibrary = function(index) {
		$scope.index = index;
		$scope.limited[index]['isOpen'] = !$scope.limited[index]['isOpen'];
		$scope.currentName = $scope.limited[index].Name;
		$scope.currentStructure = $scope.limited[index].Structure;
		$scope.currentPID = $scope.limited[index].PID;
		checkPrice();

		if($scope.lastIndex != undefined)
			$scope.limited[$scope.lastIndex]['isOpen'] = !$scope.limited[$scope.lastIndex]['isOpen'];

		$scope.lastIndex = index;

		$("html, body").animate({
			scrollTop: $("#limitedDisplay").offset().top
		}, {
			duration: 'fast', 
			easing: 'swing'
		});
		$('#wrapper')
		    // tile mouse actions
		    .on('mouseover', function() {
		      $(this).children('.limited-picture').css({'transform': 'scale(2.4)'});
		    })
		    .on('mouseout', function() {
		      $(this).children('.limited-picture').css({'transform': 'scale(1)'});
		    })
		    .on('mousemove', function(e) {
		      $(this).children('.limited-picture').css({'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 +'%'});
		    })
		    .children('.limited-picture')
		    	.css({
		    		'background-image': 'url("/images/' + $scope.currentPID +'")'
		    	});
	}
	$scope.getBackground = function(pid) { 
		if(pid === $scope.currentPID)
			outp = 'url(/images/' + pid + ')';
		else
			outp = "";
		return {
			'background-image': outp
		}
	}
});

app.controller('compoundCtrl', function($location, $scope, $sce, $http, $uibModal, $log, $document, $state){
	$http.get("/glycanapi.php/compounds")
	.then(function (response) {
		$scope.compounds = response.data;
		for(var x in $scope.compounds) {
			$scope.compounds[x]['isCollapsed'] = true;
		}
	});

/*******PRICING SECTION********/
	$scope.pnpOptions = [{
		value: '10',
		label: '1 mg'
	}];

	$scope.biotinOptions = [{
		value: '1',
		label: '100 ug'
	}];

	$scope.fluorOptions = [{
		value: '1',
		label: '50 ug'
	}];

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
		'3S',
		'IdoA',
		'GlcA2S'
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
		'Biotin',
		'Fluorescein'
	];

	$scope.displayPrice = function(price, price2, price3, multiplier) {
		display = 0;
		switch(multiplier) {
			case '1': display = price;
			break;
			case '5': display = price2;
			break;
			case '10': display = price3;
			break;
			default: display = 0;
		}
		display = Number(display);
		return display.toFixed(2);
	}

/*******END OF PRICING SECTION********/

/*******URL READING SECTION********/

	$scope.filterBy = function(x) {
		$scope.nameFilter = x;
	}

	$scope.filterDate = function(date) {
		$scope.dateFilter = date;
	}

	$scope.filterUrl = function(x, filter) {
		var search = $location.search();
		$scope.seriesFilter = search.series;
		$scope.tagFilter = search.tag;
		$scope.sizeFilter = search.size;
		$scope.dateFilter = search.date;

		if(x === $scope.seriesFilter) {
			$scope.seriesFilter = '';
			$location.search({size: $scope.sizeFilter, tag: $scope.tagFilter, date: $scope.dateFilter});
		}
		else if(x === $scope.tagFilter) {
			$scope.tagFilter = '';
			$location.search({series: $scope.seriesFilter, size: $scope.sizeFilter, date: $scope.dateFilter});
		}
		else if(x === $scope.sizeFilter) {
			$scope.sizeFilter = '';
			$location.search({series: $scope.seriesFilter, tag: $scope.tagFilter, date: $scope.dateFilter});
		}
		else if(x === $scope.dateFilter) {
			$scope.dateFilter = '';
			$location.search({series: $scope.seriesFilter, size: $scope.sizeFilter, tag: $scope.tagFilter});
		}
		else {
			switch(filter) {
				case 'date':
					$scope.dateFilter = x;
					break;
				case 'series':
					$scope.seriesFilter = x;
					break;
				case 'tag':
					$scope.tagFilter = x;
					break;
				case 'size':
					$scope.sizeFilter = x;
					break;
			}
			$location.search({series: $scope.seriesFilter, size: $scope.sizeFilter, tag: $scope.tagFilter, date: $scope.dateFilter});
		}
	}
/*******END OF URL READING SECTION********/
});

app.filter('highlight', function($sce) {
    return function(text, phrase) {
        if (phrase) {
        	var split = phrase.split("-");
        	for(var x in split) {
        		var regex = new RegExp('(' + phrase + ')','gi');
        		something = text.search(regex);
        		text = text.replace(regex, '<span class="highlighted">$1</span>');
        	}
        }
        return $sce.trustAsHtml(text)
    }
});
