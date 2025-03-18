export const translations = {
  es: {
    title: "Asistente de guiones de video",
    formSubtitle: "Introduce información de tu negocio",
    header: {
      backButton: "Volver",
      visitEpica: "Visitar Epica Works",
      contact: "Contacto"
    },
    landing: {
      hero: {
        title: "Generador de Vídeos Personalizados",
        subtitle: "Genera ideas de vídeos para publicar en YouTube Shorts y RRSS, a medida para tu empresa",
        cta: "COMENZAR"
      },
      features: [
        {
          title: "Análisis",
          description: "Introduce la web de tu empresa para conocer su actividad.",
          icon: 'video'
        },
        {
          title: "Vídeos",
          description: "Consulta ideas de vídeos a medida para tu empresa.",
          icon: 'language'
        },
        {
          title: "Oferta",
          description: "Selecciona tus favoritos y genera una oferta con ellos.",
          icon: 'content'
        }
      ]
    },
    footer: {
      contact: "contacto"
    },
    companyName: {
      label: "Nombre de la Empresa",
      placeholder: "Introduce el nombre de tu empresa"
    },
    websiteUrl: {
      label: "Web de tu empresa",
      placeholder: "www.ejemplo.com",
      analyzeButton: "Analizar web",
      analyzing: "Analizando página web..."
    },
    activity: {
      label: "Actividad",
      placeholder: "Describe la actividad de tu empresa"
    },
    videoCount: {
      label: "Número de vídeos",
      placeholder: "Selecciona el número de vídeos a generar"
    },
    language: {
      label: "Idioma"
    },
    generateScripts: {
      button: "GENERAR PROPUESTAS DE VIDEO",
      analyzing: "Generando propuesta de títulos y briefings para tus videos..."
    },
    videoScripts: {
      title: "Vídeos para",
      selectAndQuote: "Selecciona tus ideas favoritas y genera un presupuesto",
      generateQuote: "GENERAR PRESUPUESTO",
      subtitle: "Nuestra propuesta de vídeos para",
      buy: "SELECCIONAR",
      buyTooltip: "Seleccionar este video",
      selected: "SELECCIONADO",
      selectedTooltip: "Video seleccionado",
      backButton: "VOLVER A LA HOME",
      generateMore: "GENERAR MÁS IDEAS",
      generatingMore: "Generando ideas para vídeos..."
    },
    cart: {
      title: "Cesta",
      subtotal: "Subtotal",
      discount: "Descuento",
      total: "Total",
      orderButton: "REALIZAR PEDIDO"
    },
    order: {
      title: "Detalles del Pedido",
      selectedVideos: "Videos Seleccionados",
      summary: "Resumen del Pedido",
      backButton: "VOLVER A SELECCIONAR",
      downloadButton: "DESCARGAR PEDIDO (TXT)",
      payButton: "PAGAR PEDIDO",
      paymentNotAvailable: "Esta opción todavía no está disponible"
    },
    videoTypes: {
      direct: "Enfoque directo",
      indirect: "Enfoque indirecto"
    },
    sharing: {
      shareButton: "GUARDAR RESULTADOS",
      shareTooltip: "Guarda estos resultados en una URL",
      copied: "¡URL copiada al portapapeles!",
      copyError: "No se pudo copiar la URL. Por favor, inténtalo de nuevo.",
      loadShareError: "No se pudo cargar el contenido compartido. El enlace puede haber expirado."
    },
    processing: {
      analyzingWebsite: "Analizando página web...",
      generatingScripts: (count) => `Generando ${count} propuestas de video...`,
      extractingInfo: "Extrayendo información...",
      creatingProposals: "Creando propuestas de vídeo a medida",
      generatingIdeas: "Generando ideas para vídeos..."
    },
    errors: {
      websiteAnalysis: "No hemos podido analizar el sitio web. Por favor verifica la URL y prueba otra vez.\n\nSi el problema persiste contacta con nosotros: hello@epicaworks.com",
      scriptGeneration: "Error al generar propuestas de video. Por favor, inténtalo de nuevo.",
      noUrl: "Por favor, introduce una URL válida.",
      missingInfo: "Por favor, completa el nombre de la empresa y la actividad.",
      invalidResponse: "Error en el formato de respuesta. Por favor, inténtalo de nuevo.",
      noVideosGenerated: "No se pudieron generar videos. Por favor, inténtalo de nuevo.",
      noVideosSelected: "Por favor, selecciona al menos un vídeo para continuar.",
      paymentFailed: "Error al procesar el pago. Por favor, inténtalo de nuevo."
    }
  },
  en: {
    title: "Video Script Assistant",
    formSubtitle: "Enter your business information",
    header: {
      backButton: "Back",
      visitEpica: "Visit Epica Works",
      contact: "Contact"
    },
    landing: {
      hero: {
        title: "Custom Video Generator",
        subtitle: "Generate video ideas to publish on YouTube Shorts and social media, customized for your company",
        cta: "GET STARTED"
      },
      features: [
        {
          title: "Analysis",
          description: "Enter your company's website to understand its activity.",
          icon: 'video'
        },
        {
          title: "Videos",
          description: "Get custom video ideas for your company.",
          icon: 'language'
        },
        {
          title: "Quote",
          description: "Select your favorites and generate a quote.",
          icon: 'content'
        }
      ]
    },
    footer: {
      contact: "contact"
    },
    companyName: {
      label: "Company Name",
      placeholder: "Enter your company name"
    },
    websiteUrl: {
      label: "Your company website",
      placeholder: "www.example.com",
      analyzeButton: "Analyze website",
      analyzing: "Analyzing website..."
    },
    activity: {
      label: "Activity",
      placeholder: "Describe your company's activity"
    },
    videoCount: {
      label: "Number of videos",
      placeholder: "Select number of videos to generate"
    },
    language: {
      label: "Language"
    },
    generateScripts: {
      button: "GENERATE VIDEO PROPOSALS",
      analyzing: "Generating titles and briefings for your videos..."
    },
    videoScripts: {
      title: "Videos for",
      selectAndQuote: "Select your favorite ideas and generate a quote",
      generateQuote: "GENERATE QUOTE",
      subtitle: "Our video proposal for",
      buy: "SELECT",
      buyTooltip: "Select this video",
      selected: "SELECTED",
      selectedTooltip: "Video selected",
      backButton: "BACK TO HOME",
      generateMore: "GENERATE MORE IDEAS",
      generatingMore: "Generating video ideas..."
    },
    cart: {
      title: "Cart",
      subtotal: "Subtotal",
      discount: "Discount",
      total: "Total",
      orderButton: "PLACE ORDER"
    },
    order: {
      title: "Order Details",
      selectedVideos: "Selected Videos",
      summary: "Order Summary",
      backButton: "BACK TO SELECTION",
      downloadButton: "DOWNLOAD ORDER (TXT)",
      payButton: "PAY ORDER",
      paymentNotAvailable: "This option is not available yet"
    },
    videoTypes: {
      direct: "Direct focus",
      indirect: "Indirect focus"
    },
    sharing: {
      shareButton: "SAVE RESULTS",
      shareTooltip: "Save these results to a URL",
      copied: "URL copied to clipboard!",
      copyError: "Could not copy URL. Please try again.",
      loadShareError: "Could not load shared content. The link may have expired."
    },
    processing: {
      analyzingWebsite: "Analyzing website...",
      generatingScripts: (count) => `Generating ${count} video proposals...`,
      extractingInfo: "Extracting information...",
      creatingProposals: "Creating custom video proposals",
      generatingIdeas: "Generating video ideas..."
    },
    errors: {
      websiteAnalysis: "We could not analyze the website. Please verify the URL and try again.\n\nIf the problem persists contact us: hello@epicaworks.com",
      scriptGeneration: "Error generating video proposals. Please try again.",
      noUrl: "Please enter a valid URL.",
      missingInfo: "Please complete the company name and activity.",
      invalidResponse: "Response format error. Please try again.",
      noVideosGenerated: "Could not generate videos. Please try again.",
      noVideosSelected: "Please select at least one video to continue.",
      paymentFailed: "Error processing payment. Please try again."
    }
  },
  fr: {
    title: "Assistant de Script Vidéo",
    formSubtitle: "Saisissez les informations de votre entreprise",
    header: {
      backButton: "Retour",
      visitEpica: "Visiter Epica Works",
      contact: "Contact"
    },
    landing: {
      hero: {
        title: "Générateur de Vidéos Personnalisées",
        subtitle: "Générez des idées de vidéos pour publier sur YouTube Shorts et RS, sur mesure pour votre entreprise",
        cta: "COMMENCER"
      },
      features: [
        {
          title: "Analyse",
          description: "Entrez le site web de votre entreprise pour comprendre son activité.",
          icon: 'video'
        },
        {
          title: "Vidéos",
          description: "Obtenez des idées de vidéos personnalisées pour votre entreprise.",
          icon: 'language'
        },
        {
          title: "Devis",
          description: "Sélectionnez vos favoris et générez un devis.",
          icon: 'content'
        }
      ]
    },
    footer: {
      contact: "contact"
    },
    companyName: {
      label: "Nom de l'Entreprise",
      placeholder: "Entrez le nom de votre entreprise"
    },
    websiteUrl: {
      label: "Site web de votre entreprise",
      placeholder: "www.exemple.com",
      analyzeButton: "Analyser le site",
      analyzing: "Analyse du site en cours..."
    },
    activity: {
      label: "Activité",
      placeholder: "Décrivez l'activité de votre entreprise"
    },
    videoCount: {
      label: "Nombre de vidéos",
      placeholder: "Sélectionnez le nombre de vidéos à générer"
    },
    language: {
      label: "Langue"
    },
    generateScripts: {
      button: "GÉNÉRER DES PROPOSITIONS VIDÉO",
      analyzing: "Génération des titres et briefings pour vos vidéos..."
    },
    videoScripts: {
      title: "Vidéos pour",
      selectAndQuote: "Sélectionnez vos idées préférées et générez un devis",
      generateQuote: "GÉNÉRER UN DEVIS",
      subtitle: "Notre proposition de vidéos pour",
      buy: "SÉLECTIONNER",
      buyTooltip: "Sélectionner cette vidéo",
      selected: "SÉLECTIONNÉ",
      selectedTooltip: "Vidéo sélectionnée",
      backButton: "RETOUR À L'ACCUEIL",
      generateMore: "GÉNÉRER PLUS D'IDÉES",
      generatingMore: "Génération d'idées de vidéos..."
    },
    cart: {
      title: "Panier",
      subtotal: "Sous-total",
      discount: "Réduction",
      total: "Total",
      orderButton: "PASSER LA COMMANDE"
    },
    order: {
      title: "Détails de la Commande",
      selectedVideos: "Vidéos Sélectionnées",
      summary: "Résumé de la Commande",
      backButton: "RETOUR À LA SÉLECTION",
      downloadButton: "TÉLÉCHARGER LA COMMANDE (TXT)",
      payButton: "PAYER LA COMMANDE",
      paymentNotAvailable: "Cette option n'est pas encore disponible"
    },
    videoTypes: {
      direct: "Focus direct",
      indirect: "Focus indirect"
    },
    sharing: {
      shareButton: "SAUVEGARDER LES RÉSULTATS",
      shareTooltip: "Sauvegarder ces résultats dans une URL",
      copied: "URL copiée dans le presse-papiers !",
      copyError: "Impossible de copier l'URL. Veuillez réessayer.",
      loadShareError: "Impossible de charger le contenu partagé. Le lien a peut-être expiré."
    },
    processing: {
      analyzingWebsite: "Analyse du site web...",
      generatingScripts: (count) => `Génération de ${count} propositions vidéo...`,
      extractingInfo: "Extraction des informations...",
      creatingProposals: "Création de propositions vidéo personnalisées",
      generatingIdeas: "Génération d'idées de vidéos..."
    },
    errors: {
      websiteAnalysis: "Nous n'avons pas pu analyser le site web. Veuillez vérifier l'URL et réessayer.\n\nSi le problème persiste, contactez-nous : hello@epicaworks.com",
      scriptGeneration: "Erreur lors de la génération des propositions vidéo. Veuillez réessayer.",
      noUrl: "Veuillez entrer une URL valide.",
      missingInfo: "Veuillez compléter le nom de l'entreprise et l'activité.",
      invalidResponse: "Erreur de format de réponse. Veuillez réessayer.",
      noVideosGenerated: "Impossible de générer des vidéos. Veuillez réessayer.",
      noVideosSelected: "Veuillez sélectionner au moins une vidéo pour continuer.",
      paymentFailed: "Erreur lors du traitement du paiement. Veuillez réessayer."
    }
  },
  de: {
    title: "Video-Skript-Assistent",
    formSubtitle: "Geben Sie Ihre Unternehmensinformationen ein",
    header: {
      backButton: "Zurück",
      visitEpica: "Epica Works besuchen",
      contact: "Kontakt"
    },
    landing: {
      hero: {
        title: "Personalisierter Video-Generator",
        subtitle: "Generieren Sie Video-Ideen für YouTube Shorts und Social Media, individuell für Ihr Unternehmen",
        cta: "JETZT STARTEN"
      },
      features: [
        {
          title: "Analyse",
          description: "Geben Sie Ihre Unternehmenswebsite ein, um ihre Aktivität zu verstehen.",
          icon: 'video'
        },
        {
          title: "Videos",
          description: "Erhalten Sie maßgeschneiderte Video-Ideen für Ihr Unternehmen.",
          icon: 'language'
        },
        {
          title: "Angebot",
          description: "Wählen Sie Ihre Favoriten aus und erstellen Sie ein Angebot.",
          icon: 'content'
        }
      ]
    },
    footer: {
      contact: "Kontakt"
    },
    companyName: {
      label: "Firmenname",
      placeholder: "Geben Sie Ihren Firmennamen ein"
    },
    websiteUrl: {
      label: "Website Ihres Unternehmens",
      placeholder: "www.beispiel.de",
      analyzeButton: "Website analysieren",
      analyzing: "Website wird analysiert..."
    },
    activity: {
      label: "Aktivität",
      placeholder: "Beschreiben Sie die Aktivität Ihres Unternehmens"
    },
    videoCount: {
      label: "Anzahl der Videos",
      placeholder: "Wählen Sie die Anzahl der zu generierenden Videos"
    },
    language: {
      label: "Sprache"
    },
    generateScripts: {
      button: "VIDEO-VORSCHLÄGE GENERIEREN",
      analyzing: "Generiere Titel und Briefings für Ihre Videos..."
    },
    videoScripts: {
      title: "Videos für",
      selectAndQuote: "Wählen Sie Ihre Lieblingsideen aus und erstellen Sie ein Angebot",
      generateQuote: "ANGEBOT ERSTELLEN",
      subtitle: "Unser Video-Vorschlag für",
      buy: "AUSWÄHLEN",
      buyTooltip: "Dieses Video auswählen",
      selected: "AUSGEWÄHLT",
      selectedTooltip: "Video ausgewählt",
      backButton: "ZURÜCK ZUR STARTSEITE",
      generateMore: "MEHR IDEEN GENERIEREN",
      generatingMore: "Generiere Video-Ideen..."
    },
    cart: {
      title: "Warenkorb",
      subtotal: "Zwischensumme",
      discount: "Rabatt",
      total: "Gesamt",
      orderButton: "BESTELLUNG AUFGEBEN"
    },
    order: {
      title: "Bestelldetails",
      selectedVideos: "Ausgewählte Videos",
      summary: "Bestellübersicht",
      backButton: "ZURÜCK ZUR AUSWAHL",
      downloadButton: "BESTELLUNG HERUNTERLADEN (TXT)",
      payButton: "BESTELLUNG BEZAHLEN",
      paymentNotAvailable: "Diese Option ist noch nicht verfügbar"
    },
    videoTypes: {
      direct: "Direkter Fokus",
      indirect: "Indirekter Fokus"
    },
    sharing: {
      shareButton: "ERGEBNISSE SPEICHERN",
      shareTooltip: "Diese Ergebnisse in einer URL speichern",
      copied: "URL in die Zwischenablage kopiert!",
      copyError: "URL konnte nicht kopiert werden. Bitte versuchen Sie es erneut.",
      loadShareError: "Geteilter Inhalt konnte nicht geladen werden. Der Link ist möglicherweise abgelaufen."
    },
    processing: {
      analyzingWebsite: "Website wird analysiert...",
      generatingScripts: (count) => `Generiere ${count} Video-Vorschläge...`,
      extractingInfo: "Informationen werden extrahiert...",
      creatingProposals: "Erstelle maßgeschneiderte Video-Vorschläge",
      generatingIdeas: "Generiere Video-Ideen..."
    },
    errors: {
      websiteAnalysis: "Wir konnten die Website nicht analysieren. Bitte überprüfen Sie die URL und versuchen Sie es erneut.\n\nWenn das Problem weiterhin besteht, kontaktieren Sie uns: hello@epicaworks.com",
      scriptGeneration: "Fehler beim Generieren der Video-Vorschläge. Bitte versuchen Sie es erneut.",
      noUrl: "Bitte geben Sie eine gültige URL ein.",
      missingInfo: "Bitte vervollständigen Sie den Firmennamen und die Aktivität.",
      invalidResponse: "Antwortformat-Fehler. Bitte versuchen Sie es erneut.",
      noVideosGenerated: "Videos konnten nicht generiert werden. Bitte versuchen Sie es erneut.",
      noVideosSelected: "Bitte wählen Sie mindestens ein Video aus, um fortzufahren.",
      paymentFailed: "Fehler bei der Zahlungsverarbeitung. Bitte versuchen Sie es erneut."
    }
  },
  it: {
    title: "Assistente Script Video",
    formSubtitle: "Inserisci le informazioni della tua azienda",
    header: {
      backButton: "Indietro",
      visitEpica: "Visita Epica Works",
      contact: "Contatto"
    },
    landing: {
      hero: {
        title: "Generatore Video Personalizzato",
        subtitle: "Genera idee di video da pubblicare su YouTube Shorts e social, su misura per la tua azienda",
        cta: "INIZIA ORA"
      },
      features: [
        {
          title: "Analisi",
          description: "Inserisci il sito web della tua azienda per comprenderne l'attività.",
          icon: 'video'
        },
        {
          title: "Video",
          description: "Ottieni idee video personalizzate per la tua azienda.",
          icon: 'language'
        },
        {
          title: "Preventivo",
          description: "Seleziona i tuoi preferiti e genera un preventivo.",
          icon: 'content'
        }
      ]
    },
    footer: {
      contact: "contatto"
    },
    companyName: {
      label: "Nome Azienda",
      placeholder: "Inserisci il nome della tua azienda"
    },
    websiteUrl: {
      label: "Sito web della tua azienda",
      placeholder: "www.esempio.it",
      analyzeButton: "Analizza sito",
      analyzing: "Analisi del sito in corso..."
    },
    activity: {
      label: "Attività",
      placeholder: "Descrivi l'attività della tua azienda"
    },
    videoCount: {
      label: "Numero di video",
      placeholder: "Seleziona il numero di video da generare"
    },
    language: {
      label: "Lingua"
    },
    generateScripts: {
      button: "GENERA PROPOSTE VIDEO",
      analyzing: "Generazione titoli e briefing per i tuoi video..."
    },
    videoScripts: {
      title: "Video per",
      selectAndQuote: "Seleziona le tue idee preferite e genera un preventivo",
      generateQuote: "GENERA PREVENTIVO",
      subtitle: "La nostra proposta video per",
      buy: "SELEZIONA",
      buyTooltip: "Seleziona questo video",
      selected: "SELEZIONATO",
      selectedTooltip: "Video selezionato",
      backButton: "TORNA ALLA HOME",
      generateMore: "GENERA PIÙ IDEE",
      generatingMore: "Generazione idee video..."
    },
    cart: {
      title: "Carrello",
      subtotal: "Subtotale",
      discount: "Sconto",
      total: "Totale",
      orderButton: "EFFETTUA ORDINE"
    },
    order: {
      title: "Dettagli Ordine",
      selectedVideos: "Video Selezionati",
      summary: "Riepilogo Ordine",
      backButton: "TORNA ALLA SELEZIONE",
      downloadButton: "SCARICA ORDINE (TXT)",
      payButton: "PAGA ORDINE",
      paymentNotAvailable: "Questa opzione non è ancora disponibile"
    },
    videoTypes: {
      direct: "Focus diretto",
      indirect: "Focus indiretto"
    },
    sharing: {
      shareButton: "SALVA RISULTATI",
      shareTooltip: "Salva questi risultati in un URL",
      copied: "URL copiato negli appunti!",
      copyError: "Impossibile copiare l'URL. Riprova.",
      loadShareError: "Impossibile caricare il contenuto condiviso. Il link potrebbe essere scaduto."
    },
    processing: {
      analyzingWebsite: "Analisi del sito web...",
      generatingScripts: (count) => `Generazione di ${count} proposte video...`,
      extractingInfo: "Estrazione informazioni...",
      creatingProposals: "Creazione proposte video personalizzate",
      generatingIdeas: "Generazione idee video..."
    },
    errors: {
      websiteAnalysis: "Non siamo riusciti ad analizzare il sito web. Verifica l'URL e riprova.\n\nSe il problema persiste contattaci: hello@epicaworks.com",
      scriptGeneration: "Errore nella generazione delle proposte video. Riprova.",
      noUrl: "Inserisci un URL valido.",
      missingInfo: "Completa il nome dell'azienda e l'attività.",
      invalidResponse: "Errore nel formato della risposta. Riprova.",
      noVideosGenerated: "Impossibile generare i video. Riprova.",
      noVideosSelected: "Seleziona almeno un video per continuare.",
      paymentFailed: "Errore nell'elaborazione del pagamento. Riprova."
    }
  },
  pt: {
    title: "Assistente de Script de Vídeo",
    formSubtitle: "Insira as informações da sua empresa",
    header: {
      backButton: "Voltar",
      visitEpica: "Visitar Epica Works",
      contact: "Contato"
    },
    landing: {
      hero: {
        title: "Gerador de Vídeos Personalizados",
        subtitle: "Gere ideias de vídeos para publicar no YouTube Shorts e redes sociais, personalizado para sua empresa",
        cta: "COMEÇAR"
      },
      features: [
        {
          title: "Análise",
          description: "Insira o site da sua empresa para entender sua atividade.",
          icon: 'video'
        },
        {
          title: "Vídeos",
          description: "Obtenha ideias de vídeos personalizadas para sua empresa.",
          icon: 'language'
        },
        {
          title: "Orçamento",
          description: "Selecione seus favoritos e gere um orçamento.",
          icon: 'content'
        }
      ]
    },
    footer: {
      contact: "contato"
    },
    companyName: {
      label: "Nome da Empresa",
      placeholder: "Insira o nome da sua empresa"
    },
    websiteUrl: {
      label: "Site da sua empresa",
      placeholder: "www.exemplo.com.br",
      analyzeButton: "Analisar site",
      analyzing: "Analisando site..."
    },
    activity: {
      label: "Atividade",
      placeholder: "Descreva a atividade da sua empresa"
    },
    videoCount: {
      label: "Número de vídeos",
      placeholder: "Selecione o número de vídeos a gerar"
    },
    language: {
      label: "Idioma"
    },
    generateScripts: {
      button: "GERAR PROPOSTAS DE VÍDEO",
      analyzing: "Gerando títulos e briefings para seus vídeos..."
    },
    videoScripts: {
      title: "Vídeos para",
      selectAndQuote: "Selecione suas ideias favoritas e gere um orçamento",
      generateQuote: "GERAR ORÇAMENTO",
      subtitle: "Nossa proposta de vídeos para",
      buy: "SELECIONAR",
      buyTooltip: "Selecionar este vídeo",
      selected: "SELECIONADO",
      selectedTooltip: "Vídeo selecionado",
      backButton: "VOLTAR À HOME",
      generateMore: "GERAR MAIS IDEIAS",
      generatingMore: "Gerando ideias de vídeos..."
    },
    cart: {
      title: "Carrinho",
      subtotal: "Subtotal",
      discount: "Desconto",
      total: "Total",
      orderButton: "FAZER PEDIDO"
    },
    order: {
      title: "Detalhes do Pedido",
      selectedVideos: "Vídeos Selecionados",
      summary: "Resumo do Pedido",
      backButton: "VOLTAR À SELEÇÃO",
      downloadButton: "BAIXAR PEDIDO (TXT)",
      payButton: "PAGAR PEDIDO",
      paymentNotAvailable: "Esta opção ainda não está disponível"
    },
    videoTypes: {
      direct: "Foco direto",
      indirect: "Foco indireto"
    },
    sharing: {
      shareButton: "SALVAR RESULTADOS",
      shareTooltip: "Salvar estes resultados em uma URL",
      copied: "URL copiada para a área de transferência!",
      copyError: "Não foi possível copiar a URL. Tente novamente.",
      loadShareError: "Não foi possível carregar o conteúdo compartilhado. O link pode ter expirado."
    },
    processing: {
      analyzingWebsite: "Analisando site...",
      generatingScripts: (count) => `Gerando ${count} propostas de vídeo...`,
      extractingInfo: "Extraindo informações...",
      creatingProposals: "Criando propostas de vídeo personalizadas",
      generatingIdeas: "Gerando ideias de vídeos..."
    },
    errors: {
      websiteAnalysis: "Não foi possível analisar o site. Verifique a URL e tente novamente.\n\nSe o problema persistir, contate-nos: hello@epicaworks.com",
      scriptGeneration: "Erro ao gerar propostas de vídeo. Tente novamente.",
      noUrl: "Por favor, insira uma URL válida.",
      missingInfo: "Por favor, complete o nome da empresa e a atividade.",
      invalidResponse: "Erro no formato da resposta. Tente novamente.",
      noVideosGenerated: "Não foi possível gerar vídeos. Tente novamente.",
      noVideosSelected: "Por favor, selecione pelo menos um vídeo para continuar.",
      paymentFailed: "Erro ao processar o pagamento. Tente novamente."
    }
  }
}