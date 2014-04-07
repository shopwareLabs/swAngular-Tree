angular.module('swAngularTree', [])
    .directive('swAngularTree', function ($sce, $http, $compile) {
        function createNode(label, depth, item, parent) {
            return {
                label: label,
                depth: depth,
                item: item,
                spaces: [],
                parent: parent,
                children: [],
                collapsed: true,
                checked: item.checked || false
            }
        }

        function createSpace(depth) {
            var separator = '';
            if (depth < 1) {
                separator = $sce.trustAsHtml('+');
            } else {
                separator = $sce.trustAsHtml('-');
            }
            return {
                separator: separator
            }
        }

        function addSpaces(list) {
            angular.forEach(list, function (item) {
                item.spaces = [];
                for (var i = 0; i < item.depth; i++) {
                    item.spaces.push(createSpace(i));
                }
            });
            return list;
        }

        function getListFromTree(object, depth, parent) {
            if (!depth) {
                depth = 0;
            }
            if (object === undefined) {
                return [];
            }
            var list = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var item = object[key];
                    var newNode = createNode(key, depth, item, parent);
                    var childNodes = getListFromTree(item.children, depth + 1, newNode);
                    angular.forEach(childNodes, function (childNode) {
                        if (childNode.depth == depth + 1)
                            newNode.children.push(childNode);
                    });
                    list.push(newNode);
                    [].push.apply(list, childNodes);
                }
            }
            return list;
        }

        return {
            restrict: "EA",
            replace: true,
            transclude: false,
            scope: {
                object: '=ngModel',
                options: '=swOptions'
            },
            template: [
                '<div>',
                '    <div ng-repeat="node in list" ng-show="!node.parent.collapsed || options.noCollapse" ng-class="{bold: (node == currentNode)}">',
                '        <div ng-show="space" ng-repeat="space in node.spaces" ng-style="style.space">&nbsp;</div>',
                '        <span ng-style="style.node" ng-show="node.children && node.children.length > 0">',
                '            <span ng-click="toggle(node, !node.collapsed)" ng-show="node.collapsed && !options.noCollapse" class="glyphicon glyphicon-{{node.item.gridIcon_collapsed || node.item.gridIcon || options.collapsedNodeIcon || options.nodeIcon || \'folder-close\'}}"></span>',
                '            <span ng-click="toggle(node, !node.collapsed)" ng-show="!node.collapsed || options.noCollapse" class="glyphicon glyphicon-{{node.item.gridIcon_uncollapsed || node.item.gridIcon || options.uncollapsedNodeIcon || options.nodeIcon || \'folder-open\'}}"></span>',
                '            <input type="checkbox" ng-show="options.showCheckbox" ng-model="node.checked" ng-click="checkboxClick(node, node.checked!=true)"/>',
                '            <span ng-click="toggle(node, !node.collapsed)">{{node[\'label\']}}</span>',
                '        </span>',
                '        <span ng-style="style.node" ng-show="!node.children && node.children.length < 1">',
                '            <span class="glyphicon glyphicon-{{node.item.gridIcon_leaf || node.item.gridIcon || options.leafNodeIcon || options.nodeIcon || \'file\'}}"></span>',
                '            <input type="checkbox" ng-show="options.showCheckbox" ng-model="node.checked" ng-click="checkboxClick(node, node.checked!=true)"/>',
                '            <span>{{node[\'label\']}}</span>',
                '        </span>',
                '    </div>',
                '</div>'
            ].join('\n'),
            controller: function ($scope) {
                $scope.currentNode = {};


                if ($scope.options && $scope.options.listeners && typeof $scope.options.listeners.onselect == 'function') {
                    $scope.$watch('currentNode', function (newCurrentNode) {
                        $scope.options.listeners.onselect(newCurrentNode.item);
                    });
                }

                $scope.toggle = function (node, collapse) {
                    node.collapsed = collapse;

                    if (collapse) {
                        angular.forEach(node.children, function (child) {
                            $scope.toggle(child, collapse);
                        });
                    } else {
                        if (node.item.hasOwnProperty('lazyLoadUrl') && !node.item.hasOwnProperty('children')) {
                            /*
                             * Request lazy loading nodes
                             */
                            $http.get(node.item.lazyLoadUrl)
                                .then(function (result) {
                                    // Parse from json
                                    var children = angular.fromJson(result.data);

                                    // Parse to list
                                    var newList = getListFromTree(children, node.depth + 1, node);

                                    // Establish child-relationships on item level
                                    node.item.children = children;

                                    // Establish child-relationships on list level
                                    angular.forEach(newList, function (childNode) {
                                        if (childNode.depth == node.depth + 1)
                                            node.children.push(childNode);
                                    });

                                    // Insert new list items into list
                                    var nodePosition = $scope.list.indexOf(node);
                                    for (var i = 1; i <= newList.length; i++) {
                                        $scope.list.splice(nodePosition + i, 0, newList[i - 1]);
                                    }

                                    // Add the spaces
                                    addSpaces($scope.list);
                                });
                        }
                    }

                    $scope.currentNode = node;
                };

                $scope.checkboxClick = function (node, checked) {
                    if ($scope.options && $scope.options.listeners && typeof $scope.options.listeners.oncheckboxchange == 'function') {
                        $scope.options.listeners.oncheckboxchange(node.item, checked);
                    }
                };
            },
            link: function ($scope, $element, $attrs) {
                $scope.style = {};
                $scope.style.space = {width: '20px', float: 'left'};
                $scope.style.node = {
                    cursor: $scope.options.noCollapse ? 'default' : 'pointer'
                };


                $scope.$watch('object', function (changedObject) {
                    $scope.list = getListFromTree(changedObject);
                    addSpaces($scope.list);
                });
            }
        };
    })
;