(function () {
  var App = {
    CHAT: $('[data-js-chat]'),
    INPUT: $('[data-js-text-input]'),
    NICKNAME: $('[data-js-nickname]'),
    TEMPLATE: $('[data-js-template]'),
    MESSAGES: $('[data-js-messages]'),

    init: function () {
      this.handleInput();

      if (!this.chatIsStarted()) {
        this.startChat();
      } else {
        this.loadChat();
      }
    },

    chatIsStarted: function () {
      return this.chatId().length > 0;
    },

    chatId: function () {
      return document.location.hash.replace('#', '');
    },

    startChat: function () {
      $.get('/start', function (response) {
        document.location.hash = response.chat_id;
        App.loadChat();
      });
    },

    handleInput: function () {
      var $messageForm = $('[data-js-message-form]');

      $messageForm.submit(function (ev) {
        ev.preventDefault();

        var message = App.INPUT.val();
        $.post('/messages', {
          message: message,
          chat_id: App.chatId(),
          author: App.getAuthor()
        });

        App.INPUT.val('');
      });
    },

    getAuthor: function () {
      return $.cookie('author') || App.NICKNAME.val();
    },

    setAuthor: function (name) {
      $.cookie('author', name, { path: '/' });
    },

    loadChat: function () {
      this.TEMPLATE.hide();
      this.CHAT.show();
      this.loadNickname();
      this.handleNicknameChange();
      this.loadMessages();
      this.scrollToBottom();

      setInterval(this.loadMessages, 500);
    },

    loadNickname: function () {
      this.NICKNAME.val(this.getAuthor() || 'stranger');
    },

    handleNicknameChange: function() {
      this.NICKNAME.on('keyup', function () {
        App.setAuthor(App.NICKNAME.val());
      });
    },

    loadMessages: function () {
      $.get('/messages', { chat_id: App.chatId() }, function (response) {
        var scroll = false;
        if (!response.success) {
          return;
        }

        var messages = response.messages;
        for (var i = 0; i < messages.length; ++i) {
          if (!$('[data-js-message-id=' + messages[i].id + ']').length) {
            scroll = true;
            App.MESSAGES.append(App.messageBody(messages[i]));
          }
        }

        if (scroll) {
          App.scrollToBottom();
        }
      });
    },

    messageBody: function (vars) {
      var template = this.TEMPLATE.html();
      var keys = Object.keys(vars);

      for (var i = 0; i < keys.length; ++i) {
        var key = '!' + keys[i] + '!'
        template = template.replace(key, vars[keys[i]]);
      }

      return template;
    },

    scrollToBottom: function() {
      $('.messages').scrollTop($('.messages').prop('scrollHeight'));
    },
  };

  $(document).ready(function () {
    App.init();
  });
})();
