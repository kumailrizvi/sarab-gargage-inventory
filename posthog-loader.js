/*
  Safe PostHog loader for Sarab Al Madina Portal.
  - Disabled by default from config.js.
  - Does not write to Supabase/localStorage app data.
  - Autocapture/session replay/heatmaps are disabled to avoid capturing form/table contents.
*/
(function(){
  const cfg = (window.SARAB_CONFIG && window.SARAB_CONFIG.POSTHOG) || {};
  const enabled = Boolean(cfg.ENABLED && cfg.PROJECT_KEY);
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const safeNoop = {
    enabled: false,
    identify(){},
    capture(){},
    page(){},
    reset(){}
  };

  window.sarabAnalytics = safeNoop;
  if(!enabled) return;
  if(isLocal && !cfg.CAPTURE_LOCALHOST) return;

  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split('.');2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement('script')).type='text/javascript',p.crossOrigin='anonymous',p.async=!0,p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],u.toString=function(t){var e='posthog';return'posthog'!==a&&(e+='.'+a),t||(e+=' (stub)'),e},u.people.toString=function(){return u.toString(1)+'.people (stub)'},o='init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(cfg.PROJECT_KEY, {
    api_host: cfg.API_HOST || 'https://us.i.posthog.com',
    defaults: '2026-01-30',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    disable_session_recording: true,
    enable_heatmaps: false,
    enable_recording_console_log: false,
    mask_all_text: true,
    mask_all_element_attributes: true,
    person_profiles: 'identified_only',
    property_denylist: ['email','phone','password','token','supabase','parts','jobs','vehicles','employees','clients','notes','description'],
    before_send: function(event){
      if(!event || !event.properties) return event;
      const safe = {};
      const allowed = ['$current_url','$pathname','$host','$browser','$device_type','$os','$lib','app_view','source','action','status','role','view','module','record_type','mode','month','category','subview','filter_type','sort_key','sort_dir','result','count','row_count','line_count','part_count','vehicle_count','employee_count','ticket_count','client_count','visible_count','has_parts','has_custom_charges','has_labour','is_locked','is_edit','is_import','is_export','file_type','operation','from_view'];
      allowed.forEach(k => { if(event.properties[k] !== undefined) safe[k] = event.properties[k]; });
      event.properties = safe;
      return event;
    }
  });

  window.sarabAnalytics = {
    enabled: true,
    identify(userId, props){
      if(!userId || !window.posthog) return;
      posthog.identify(String(userId), props || {});
    },
    capture(name, props){
      if(!window.posthog) return;
      posthog.capture(name, props || {});
    },
    page(view){
      if(!window.posthog) return;
      posthog.capture('$pageview', { app_view: String(view || 'unknown'), $pathname: window.location.pathname });
    },
    reset(){
      if(window.posthog) posthog.reset();
    }
  };
})();
