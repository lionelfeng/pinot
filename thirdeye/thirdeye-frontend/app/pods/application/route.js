import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import fetch from 'fetch';
import { checkStatus } from 'thirdeye-frontend/helpers/utils';

export default Ember.Route.extend(ApplicationRouteMixin, {
  moment: Ember.inject.service(),
  session: Ember.inject.service(),

  beforeModel() {
    // calling this._super to trigger ember-simple-auth's hook
    this._super(...arguments);

    // invalidates session if cookie expired
    if (this.get('session.isAuthenticated')) {
      fetch('/auth')
        .then(checkStatus)
        .catch(() => {
          this.get('session').invalidate();
        });
    }

    this.get('moment').setTimeZone('America/Los_Angeles');
  },

  model(params, transition) {
    const { targetName } = transition;

    // This is used to hide the navbar when accessing the screenshot page
    return targetName !== 'screenshot';
  },
  /**
   * Redirect route after authentication
   * @override ApplicationRouteMixin.routeAfterAuthentication
   */
  routeAfterAuthentication: 'rca',

  /**
   * Augments sessionAuthenticated.
   * @override ApplicationRouteMixin.sessionAuthenticated
   */
  sessionAuthenticated() {
    this._super(...arguments);

    this.transitionTo('rca');
  },

  /**
   * Augments sessionInvalidated so that it doesn't redirect
   * to rootURL defined in environment.js
   * @override ApplicationRouteMixin.sessionInvalidated
   */
  sessionInvalidated() {
    this.transitionTo('login');
  }
});
