Shopware AngularJs -- swAngular Tree
=====================================

This is an Shopware-AngularJs Component, it can be installed via Bower.

## Installation

Via [bower](http://bower.io):

	bower install sw-angular-tree

## How to Use the Component


###Show simple tree
A tree expects data of the following structure:

    $scope.exampleData = {
        item1: {
            gridIcon_collapsed: 'star',
            gridIcon_uncollapsed: 'star-empty'
        },
        item2: {
            age: 4,
            gridIcon: 'trash',
            test: 'knoten',
            children: {
                item3: {},
                "item4 lazy": {
                    lazyLoadUrl: 'http://localhost/asyncTreeElements.php'
                },
                item6: {}
            }
        },
        item7: {}
    };
    
Currently, the following structure is expected:

* Child-Relationships are defined by `children`
* Special icons for one node may be defined as Glyphicon via `gridIcon`, `gridIcon_collapsed` and `gridIcon_uncollapsed`
* Lazy loading may be defined by an URL in `lazyLoadUrl`, which is expected to return a JSON array response that is parsed and used as new children object of the lazy node

        PHP: echo json_encode(array('newElem1' => array('coolElem' => 'this is cool'),..));

The directive is used as follows:

    &lt;sw-angular-tree ng-model="exampleData" sw-options="options"&gt;&lt;/sw-angular-tree&gt;

Options are not required. If options are given via `$scope.options`, they may serve a handler for tree node selected and/or node icons (as Glyphicon strings). Example options may look like this:

    $scope.options = {
        nodeIcon: 'trash',
        listeners: {
            onselect: function (newItem) {
                $scope.selectedNode = newItem;
            }
        }
    };
    
Besides `nodeIcon` you may want to define explicit icons `collapsedNodeIcon` and `uncollapsedNodeIcon`.

###Examples

Here are some [Examples](http://swangular.shopware.de.cloud2-vm153.de-nserver.de/#/simpleGrid)