var initializedDB = {
  state: false,
  domain: '',
  hooks: {
    dom_text_node_mutation: [],
    document_location_hash: [],
    document_referrer: [],
    document_cookie: [],
    window_eval: [],
    document_write: [],
    window_setTimeout: [],
    window_setInterval: [],
    xhr: [],
    ws: [],
    unsafeAnchors: []
  },
  settings: {
    // Everything that will be hooked
    hooks: {
      dom_text_node_mutation: {
        enabled: true,
        description: 'Enable mutation observer on all new text added to the DOM.',
        section: 'sinks',
        do_not_list_preference_key: 'doNotShowDomMutationEvents'
      },
      document_location_hash: {
        enabled: true,
        description: 'Hook location.hash',
        section: 'sources'
      },
      document_referrer: {
        enabled: true,
        description: 'Hook document.referrer',
        section: 'sources'
      },
      document_cookie: {
        enabled: true,
        description: 'Hook document.cookie',
        section: 'sources'
      },
      window_eval: {
        enabled: true,
        description: 'Hook eval calls',
        section: 'sinks'
      },
      document_write: {
        enabled: true,
        description: 'Hook document.write',
        section: 'sinks'
      },
      window_setTimeout: {
        enabled: false,
        description: 'Hook setTimeout',
        section: 'sinks'
      },
      window_setInterval: {
        enabled: false,
        description: 'Hook setInterval',
        section: 'sinks'
      },
      xhr: {
        enabled: true,
        description: 'Hook XMLHttpRequests',
        libToInject: "xhook",
        section: 'xhr'
      },
      ws: {
        enabled: true,
        description: 'Hook WebSockets',
        libToInject: "wshook",
        section: 'ws'
      },
      unsafeAnchors: {
        enabled: false,
        description: 'Hook anchor tags',
        xdomain: true,
        section: 'unsafeAnchors'
      }
    },
    preferences: {
      ignoreEmptyValues: {
        enabled: true,
        description: 'Ignore Sources and Sinks with empty values'
      },
      doNotShowDomMutationEvents: {
        enabled: true,
        description: 'Ignore results from DOM Mutation events'
      }
    }
  },

  sections: {
    sources: {
      settingName: 'sources',
      displayName: 'Sources',
      tableHeadings: ['Name', 'Type', 'Value', 'Location']
    },
    sinks: {
      settingName: 'sinks',
      displayName: 'Sinks',
      tableHeadings: ['Name', 'Type', 'Value', 'Location']
    },
    xhr: {
      settingName: 'xhr',
      displayName: 'XMLHttpRequests',
      tableHeadings: ['Method', 'URL']
    },
    ws: {
      settingName: 'ws',
      displayName: 'WebSockets',
      tableHeadings: ['Type', 'Data']
    }

  }

};