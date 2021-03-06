(function() {
  var ConfirmationDialog, FormDialog, InfoDialog, LoadingIndicator, ProfileView, User, UserCollection, formDialog, infoDialog, loadingIndicator, profileApp;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  FormDialog = (function() {

    function FormDialog() {
      var div;
      if ($("#form-dialog").length === 0) {
        div = document.createElement('div');
        div.id = "form-dialog";
        div.className = "dialog";
        $("body").prepend(div);
        this.element = $("#form-dialog");
        this.element.html('<div id="form-dialog-text"></div>\n<div id="form-dialog-fields">\n</div>\n<div id="form-dialog-buttons">\n  <span id="form-dialog-yes">ok</span>\n  <span id="form-dialog-no">cancel</span>\n</div>');
      }
      this.element = $("#form-dialog");
      this.setNoButton;
      this.element.hide();
      this.fields = [];
    }

    FormDialog.prototype.addField = function(field) {
      this.fields.push(field);
      if (field.label) {
        $("#form-dialog-fields").append("<label for=\"" + field.name + "\"></label>");
      }
      return $("#form-dialog-fields").append("<input class=\"form-dialog-field\"                 id=\"form-dialog-field-" + field.name + "\"                type=\"text\"                 name=\"" + field.name + "\" />");
    };

    FormDialog.prototype.clearFields = function() {
      this.fields = [];
      return $("#form-dialog-fields").html(null);
    };

    FormDialog.prototype.setNoButton = function() {
      var _this = this;
      return $("#form-dialog-no").click(function() {
        return _this.element.fadeOut();
      }, false);
    };

    FormDialog.prototype.display = function(text, callback) {
      var field, _i, _len, _ref, _results;
      var _this = this;
      $("#form-dialog-text").empty();
      $("#form-dialog-text").append('<span>' + text + '</span>');
      $("#form-dialog-yes").click(callback);
      $("#form-dialog-no").click(function() {
        return _this.element.hide();
      });
      this.element.show();
      if (this.fields) {
        document.getElementById("form-dialog-field-" + this.fields[0].name).focus();
        _ref = this.fields;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          field = _ref[_i];
          _results.push($("#form-dialog-field-" + field.name).keyup(function(event) {
            if (event.keyCode === 13) return callback();
          }));
        }
        return _results;
      }
    };

    FormDialog.prototype.getVal = function(fieldIndex) {
      return $("#form-dialog-field-" + this.fields[fieldIndex].name).val();
    };

    FormDialog.prototype.hide = function() {
      return this.element.fadeOut();
    };

    return FormDialog;

  })();

  LoadingIndicator = (function() {

    function LoadingIndicator() {
      var div;
      if ($("#loading-indicator").length === 0) {
        div = document.createElement('div');
        div.id = "loading-indicator";
        div.innerHTML = '<img src="/static/images/clock_32.png" />';
        $("body").prepend(div);
      }
      this.element = $("#loading-indicator");
      this.element.hide();
    }

    LoadingIndicator.prototype.display = function() {
      return this.element.show();
    };

    LoadingIndicator.prototype.hide = function() {
      return this.element.hide();
    };

    return LoadingIndicator;

  })();

  InfoDialog = (function() {

    function InfoDialog() {
      var div;
      if ($("#info-dialog").length === 0) {
        div = document.createElement('div');
        div.id = "info-dialog";
        div.className = "dialog";
        $("body").prepend(div);
      }
      this.element = $("#info-dialog");
      this.element.hide();
    }

    InfoDialog.prototype.display = function(text) {
      this.element.empty();
      this.element.append(text);
      this.element.show();
      return this.element.fadeOut(4000);
    };

    return InfoDialog;

  })();

  ConfirmationDialog = (function() {

    function ConfirmationDialog(callback) {
      var div;
      if ($("#confirmation-dialog").length === 0) {
        div = document.createElement('div');
        div.id = "confirmation-dialog";
        div.className = "dialog";
        div.innerHTML = '<div id="confirmation-text"></div>';
        div.innerHTML += '<div id="confirmation-buttons">' + '<span href="" id="confirmation-yes">Yes</span>' + '<span href="" id="confirmation-no">No</span>' + '</div>';
        $("body").prepend(div);
      }
      this.element = $("#confirmation-dialog");
      this.element.hide();
      this.setNoButton();
    }

    ConfirmationDialog.prototype.setNoButton = function() {
      var divElement;
      divElement = this.element;
      return $("#confirmation-no").click(function() {
        divElement.fadeOut();
        return false;
      });
    };

    ConfirmationDialog.prototype.display = function(text, callback) {
      var left, top;
      $("#confirmation-text").empty();
      $("#confirmation-text").append('<span>' + text + '</span>');
      $("#confirmation-yes").click(callback);
      this.element.show();
      top = $("body").scrollTop() + 200;
      left = this.element.offset().left;
      return this.element.offset({
        left: left,
        top: top
      });
    };

    ConfirmationDialog.prototype.hide = function() {
      return this.element.fadeOut();
    };

    return ConfirmationDialog;

  })();

  ProfileView = (function() {

    __extends(ProfileView, Backbone.View);

    ProfileView.prototype.el = $("#profile");

    function ProfileView() {
      this.onUrlKeyUp = __bind(this.onUrlKeyUp, this);
      this.onDescriptionEditClicked = __bind(this.onDescriptionEditClicked, this);
      this.onMouseOut = __bind(this.onMouseOut, this);
      this.onMouseOver = __bind(this.onMouseOver, this);      ProfileView.__super__.constructor.call(this);
    }

    ProfileView.prototype.initialize = function() {
      _.bindAll(this, 'onKeyUp', 'postUserInfo', 'fetch', 'addAll');
      this.users = new UserCollection;
      this.isEditing = false;
      return this.users.bind('reset', this.addAll);
    };

    /* Events
    */

    ProfileView.prototype.events = {
      "click #profile-description-edit": "onDescriptionEditClicked",
      "click #profile-change-password": "onChangePasswordClicked",
      "mouseover #profile div.app": "onMouseOver",
      "mouseout #profile div.app": "onMouseOut"
    };

    ProfileView.prototype.onKeyUp = function(event) {
      this.postUserInfo();
      return event;
    };

    ProfileView.prototype.onMouseOver = function(event) {
      $("#profile-description-edit").show();
      return $("#profile-change-password").show();
    };

    ProfileView.prototype.onMouseOut = function(event) {
      $("#profile-description-edit").hide();
      return $("#profile-change-password").hide();
    };

    ProfileView.prototype.onDescriptionEditClicked = function(event) {
      if (!this.isEditing) {
        this.isEditing = true;
        $("#profile-description-display").fadeOut(function() {
          $("#profile-description-display").hide();
          return $("#profile-description").slideDown(function() {
            return $("#profile-preview").fadeIn();
          });
        });
      } else {
        this.isEditing = false;
        $("#profile-preview").fadeOut(function() {
          return $("#profile-description").slideUp(function() {
            return $("#profile-description-display").fadeIn();
          });
        });
      }
      return false;
    };

    ProfileView.prototype.onChangePasswordClicked = function(event) {
      formDialog.clearFields();
      formDialog.addField({
        name: "new-password"
      });
      return formDialog.display("Type your new sesame", function() {
        var _this = this;
        if (formDialog.getVal(0) && formDialog.getVal(0).length > 3) {
          loadingIndicator.display();
          return $.ajax({
            type: "PUT",
            url: "/user/password/",
            data: "{\"password\":\"" + (formDialog.getVal(0)) + "\"}",
            dataType: "json",
            success: function() {
              formDialog.hide();
              return loadingIndicator.hide();
            },
            error: function() {
              formDialog.hide();
              loadingIndicator.hide();
              return infoDialog.display("Error occured while changing sesame.");
            }
          });
        } else {
          return infoDialog.display("Please enter a sesame with at least 4 characters");
        }
      });
    };

    ProfileView.prototype.onUrlKeyUp = function() {
      var regexp, url;
      regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?\/$/;
      url = this.urlField.val();
      if (url.match(regexp)) {
        this.postUserInfo();
        return this.urlFieldError.hide();
      } else {
        return this.urlFieldError.show();
      }
    };

    /* Functions
    */

    ProfileView.prototype.addAll = function() {
      this.users;
      this.user = this.users.first();
      $("#platform-profile-name").val(this.user.getName());
      $("#profile-description").val(this.user.getDescription());
      $("#platform-profile-url").val(this.user.get("url"));
      this.renderProfile();
      if (!this.user.get("url")) {
        this.tutorialOn = true;
        this.displayTutorial(1);
      }
      return this.users;
    };

    ProfileView.prototype.fetch = function() {
      this.users.fetch();
      return this.users;
    };

    ProfileView.prototype.postUserInfo = function() {
      var tutorialOn;
      $("#profile").addClass("modified");
      tutorialOn = this.tutorialOn;
      this.user.save({
        name: $("#platform-profile-name").val(),
        url: $("#platform-profile-url").val(),
        description: $("#profile-description").val()
      }, {
        success: function() {
          if (tutorialOn) {
            $.get("/profile/tutorial/2/", function(data) {
              return $("#tutorial-profile").html(data);
            });
          }
          return $("#profile").removeClass("modified");
        }
      });
      return this.renderProfile();
    };

    ProfileView.prototype.testTutorial = function() {
      if (this.tutorialOn) {
        this.displayTutorial(2);
        this.tutorialOn = false;
      }
      return false;
    };

    ProfileView.prototype.displayTutorial = function(index) {
      return $.get("/profile/tutorial/" + index + "/", function(data) {
        return $("#tutorial-profile").html(data);
      });
    };

    ProfileView.prototype.renderProfile = function() {
      var converter, desc, renderer;
      renderer = _.template('<h1 class="profile-name"><%= name %></h1>\n<p class="profile-url"><%= url %></p>\n<p class="profile-description"><%= description %></p>');
      desc = $("#profile-description").val();
      converter = new Showdown.converter();
      desc = converter.makeHtml(desc);
      $("#profile-description-display").html(desc);
      $("#profile-render").html(renderer({
        name: $("#platform-profile-name").val(),
        url: $("#platform-profile-url").val(),
        description: desc
      }));
      return this.user;
    };

    /* UI Builders
    */

    ProfileView.prototype.setListeners = function() {
      $("#platform-profile-name").keyup(function(event) {
        return profileApp.onKeyUp(event);
      });
      $("#platform-profile-url").keyup(this.onUrlKeyUp);
      return $("#profile-description").keyup(function(event) {
        return profileApp.onKeyUp(event);
      });
    };

    ProfileView.prototype.setWidgets = function() {
      $("#profile input").val(null);
      $("#profile-a").addClass("disabled");
      $("#profile-description").hide();
      $("#profile-preview").hide();
      $("#profile-description-edit").button();
      $("#profile-description-edit").hide();
      $("#profile-change-password").button();
      $("#profile-change-password").hide();
      this.urlField = $("#platform-profile-url");
      this.urlFieldError = $("#profile-url-error");
      return this.urlFieldError.hide();
    };

    return ProfileView;

  })();

  User = (function() {

    __extends(User, Backbone.Model);

    User.prototype.url = '/user/';

    function User(user) {
      User.__super__.constructor.apply(this, arguments);
      this.id = "";
      this.set("url", user.url);
      this.set("name", user.name);
      this.set("description", user.description);
    }

    /* Setters / Accessors
    */

    User.prototype.getName = function() {
      return this.get("name");
    };

    User.prototype.setName = function(name) {
      alert(name);
      this.set("name", name);
      return alert(this.getName());
    };

    User.prototype.getUrl = function() {
      return this.get("userUrl");
    };

    User.prototype.setUrl = function(url) {
      return this.set("url", url);
    };

    User.prototype.getDescription = function() {
      return this.get("description");
    };

    User.prototype.setDescription = function(description) {
      return this.set("description", description);
    };

    User.prototype.isNew = function() {
      return false;
    };

    return User;

  })();

  /* Model for a User collection
  */

  UserCollection = (function() {

    __extends(UserCollection, Backbone.Collection);

    function UserCollection() {
      UserCollection.__super__.constructor.apply(this, arguments);
    }

    UserCollection.prototype.model = User;

    UserCollection.prototype.url = '/user/';

    UserCollection.prototype.parse = function(response) {
      return response.rows;
    };

    return UserCollection;

  })();

  profileApp = new ProfileView;

  formDialog = new FormDialog;

  infoDialog = new InfoDialog;

  loadingIndicator = new LoadingIndicator;

  profileApp.setWidgets();

  profileApp.setListeners();

  profileApp.fetch();

}).call(this);
