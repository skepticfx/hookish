var initializedDB = {
  state: false,
  domain: '',
  hooks: {
    dom_nodes: [],
    dom_text_node_mutation: [],
    document_location_hash: [],
    document_referrer: [],
    document_cookie: [],
    window_name: [],
    window_eval: [],
    document_write: [],
    window_setTimeout: [],
    window_setInterval: [],
    xhr: [],
    ws: [],
    unsafeAnchors: [],
    globalVariables: [],
    jsScripts: []
  },
  settings: {
    // Everything that will be hooked
    hooks: {
      globalVariables: {
        enabled: true,
        description: 'Fetch all Global Variables'
      },
      jsScripts: {
        enabled: true,
        description: 'Fetch all scripts (required for static analysis)'
      },
      dom_nodes: {
        enabled: true,
        description: 'Hook all DOM properties (innerHTML etc)',
        do_not_list_preference_key: 'doNotShowDomNodes'
      },
      dom_text_node_mutation: {
        enabled: false,
        description: 'Enable mutation observer on all new text added to the DOM.',
        do_not_list_preference_key: 'doNotShowDomMutationEvents'
      },
      document_location_hash: {
        enabled: false,
        description: 'Hook location.hash'
      },
      document_referrer: {
        enabled: true,
        description: 'Hook document.referrer',
        section: 'sources'
      },
      window_name: {
        enabled: true,
        description: 'Hook window.name'
      },
      document_cookie: {
        enabled: true,
        description: 'Hook document.cookie'
      },
      window_eval: {
        enabled: true,
        description: 'Hook eval calls'
      },
      document_write: {
        enabled: true,
        description: 'Hook document.write'
      },
      window_setTimeout: {
        enabled: false,
        description: 'Hook setTimeout'
      },
      window_setInterval: {
        enabled: false,
        description: 'Hook setInterval'
      },
      xhr: {
        enabled: true,
        description: 'Hook XMLHttpRequests',
        libToInject: "xhook"
      },
      ws: {
        enabled: true,
        description: 'Hook WebSockets',
        libToInject: "wshook"
      },
      unsafeAnchors: {
        enabled: true,
        description: 'Hook anchor tags',
        xdomain: false
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
      },
      doNotShowDomNodes: {
        enabled: false,
        description: 'Ignore results from DOM Nodes'
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
    },
    unsafeAnchors: {
      settingName: 'unsafeAnchors',
      displayName: 'Anchor tags to analyze (target=_blank)',
      tableHeadings: ['Href']
    }

  },

  lastCollectedScripts: []

};