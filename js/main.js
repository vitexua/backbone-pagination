// **This example introduces two new Model actions (swap and delete), illustrating how such actions can be handled within a Model's View.**
//
// _Working example: [5.html](../5.html)._

//
var listView;
(function($) {
    // `Backbone.sync`: Overrides persistence storage with dummy function. This enables use of `Model.destroy()` without raising an error.
    //Backbone.sync = function(method, model, success, error){
    //  success();
    //}

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    var Item = Backbone.Model.extend({
        defaults: {
            part1: 'hello',
            part2: 'world',
            fields: 'field text'
        }
    });

    var List = Backbone.Collection.extend({
        url: '/list',
        model: Item,
        success: function() {
            console.log('success');
        }
    });

    var ItemView = Backbone.View.extend({
        tagName: 'li', // name of tag to be created
        // `ItemView`s now respond to two clickable actions for each `Item`: swap and delete.
        events: {
            'click span.swap':  'swap',
            'click span.delete': 'remove'
        },
        // `initialize()` now binds model change/removal to the corresponding handlers below.
        initialize: function() {
            _.bindAll(this, 'render', 'unrender', 'swap', 'remove'); // every function that uses 'this' as the current object should be in here

            this.model.bind('change', this.render);
            this.model.bind('remove', this.unrender);
        },
        // `render()` now includes two extra `span`s corresponding to the actions swap and delete.
        render: function() {
            $(this.el).html('<form><input type="text" id="name"> </form> Name: <span data-bind="text name; class name"></span> <span style="color:black;">' + this.model.get('part1') + ' ' + this.model.get('part2') + '</span> &nbsp; &nbsp; <span class="swap" style="font-family:sans-serif; color:blue; cursor:pointer;">[swap]</span> <span class="delete" style="cursor:pointer; color:red; font-family:sans-serif;">[delete]</span>');
            Backbone.ModelBinding.bind(this);

            return this; // for chainable calls, like .render().el
        },
        // `unrender()`: Makes Model remove itself from the DOM.
        unrender: function() {
//            listView.reRender();
        },
        // `swap()` will interchange an `Item`'s attributes. When the `.set()` model function is called, the event `change` will be triggered.
        swap: function() {
            var swapped = {
                part1: this.model.get('part2'),
                part2: this.model.get('part1')
            };
            this.model.set(swapped);
        },
        // `remove()`: We use the method `destroy()` to remove a model from its collection. Normally this would also delete the record from its persistent storage, but we have overridden that (see above).
        remove: function() {
            this.model.destroy();
            listView.reRender();
        }
    });

    // Because the new features (swap and delete) are intrinsic to each `Item`, there is no need to modify `ListView`.
    var ListView = Backbone.View.extend({
        el: $('body'), // el attaches to existing element
        page: 1,
        totalPages: 1,
        events: {
            'click button#add': 'addItem',
            'click span.previous': 'toPrevious',
            'click span.next': 'toNext'
        },
        initialize: function() {
            _.bindAll(this, 'render', 'reRender', 'reRenderAfterAdd', 'addItem', 'toPrevious', 'toNext', 'appendItem'); // every function that uses 'this' as the current object should be in here

            this.collection = new List();
            this.collection.bind('add', this.reRenderAfterAdd, this); // collection event binder

            this.counter = 0;
            this.render();
        },
        render: function() {
            $(this.el).append("<button id='add'>Add list item</button>");
            $(this.el).append("<ul></ul>");
            $(this.el).append('<p class="pager">Page <span class="previous">[Previous]</span> <span class="curent">1</span> of <span class="total">1</span> <span class="next">[Next]</span></p>');
            var that = this;
            _.each(_.last(this.collection.models, 10), function(item){
                that.appendItem(item);
            });
        },
        reRender: function() {
            $('ul', this.el).html('');
            var that = this;
            this.totalPages = Math.floor((this.collection.models.length - 1) / 10 + 1);

            var count = 0;
            _(_.first(_.rest(this.collection.models, this.page * 10 - 10), 10)).each(function(item) { // in case collection is not empty
                that.appendItem(item);
                count++;
            }, this);

            if(count === 0 && this.page !== 1) {
                this.page--;
                this.reRender();
            }

            $('.pager .curent', this.el).html(this.page);
            $('.pager .total', this.el).html(this.totalPages);
        },
        reRenderAfterAdd: function() {
            this.reRender();
            if(this.totalPages !== this.page) {
                this.page = this.totalPages;
                this.reRender();
            }
        },
        addItem: function() {
            this.counter++;
            var item = new Item();
            item.set({
                part2: item.get('part2') + this.counter // modify item defaults
            });
            this.collection.add(item);
        },
        toPrevious: function() {
            this.page > 1 ? this.page-- : null;
            this.reRender();
        },
        toNext: function() {
            this.page < this.totalPages ? this.page++ : null;
            this.reRender();
        },
        appendItem: function(item) {
            var itemView = new ItemView({
                model: item
            });
            $('ul', this.el).append(itemView.render().el);
        }
    });

    listView = new ListView();
//    listView2 = new ListView();

    _.each(_.range(1, 40), function(item){
        listView.addItem();
    });
})(jQuery);