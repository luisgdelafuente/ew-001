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
        subtitle: "Genera los titulos y resúmenes de vídeos que tu empresa necesita publicar en YouTube Shorts y las redes",
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
      label: "Web de tu empresa o producto",
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
    // ... (keeping other translations as they were)
  }
}