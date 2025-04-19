// Script to detect mobile devices and apply appropriate classes for better styling

// Function to check if the device is mobile
function isMobileDevice() {
  return (window.innerWidth <= 640 || 
          navigator.maxTouchPoints > 0 ||
          navigator.userAgent.toLowerCase().includes('mobi'));
}

// Function to apply mobile-specific classes to chat elements
function applyMobileClasses() {
  if (!isMobileDevice()) return;
  
  // Get the current URL
  const currentUrl = window.location.href;
  
  // Only apply on chat pages
  if (!currentUrl.includes('/chat')) return;
  
  // Wait for DOM to be fully loaded
  setTimeout(() => {
    // Add chat-content class to the main chat container
    const chatContainers = document.querySelectorAll('.h-screen, .flex-1, .flex.flex-col');
    chatContainers.forEach(container => {
      container.classList.add('chat-content');
    });
    
    // Add chat-input-container class to the input area
    const inputContainers = document.querySelectorAll('[class*="sticky bottom-0"]');
    inputContainers.forEach(container => {
      container.classList.add('chat-input-container');
    });
    
    // Add chat-input class to input elements
    const inputs = document.querySelectorAll('textarea, input');
    inputs.forEach(input => {
      input.classList.add('chat-input');
    });
    
    // Add event-type-grid class to event type selection grids
    const eventGrids = document.querySelectorAll('.grid-cols-2, .grid-cols-3');
    eventGrids.forEach(grid => {
      grid.classList.add('event-type-grid');
      
      // Add event-type-item class to children
      const items = grid.querySelectorAll('button');
      items.forEach(item => {
        item.classList.add('event-type-item');
        
        // Find emoji element and add event-type-icon class
        const emoji = item.querySelector('span');
        if (emoji) {
          emoji.classList.add('event-type-icon');
        }
        
        // Find text element and add event-type-name class
        const textNodes = Array.from(item.childNodes).filter(node => 
          node.nodeType === Node.TEXT_NODE || 
          (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('event-type-icon'))
        );
        
        if (textNodes.length > 0) {
          const lastTextNode = textNodes[textNodes.length - 1];
          if (lastTextNode.nodeType === Node.ELEMENT_NODE) {
            lastTextNode.classList.add('event-type-name');
          }
        }
      });
    });
    
    // Add chat-bubble and specific classes to message bubbles
    const messages = document.querySelectorAll('[class*="message"]');
    messages.forEach(message => {
      message.classList.add('chat-bubble');
      
      // Check if it's a bot or user message
      if (message.classList.contains('bg-white') || 
          message.classList.contains('bg-gray-100') ||
          message.classList.contains('bg-gray-50')) {
        message.classList.add('chat-bubble-bot');
      } else {
        message.classList.add('chat-bubble-user');
      }
    });
    
    // Add vendor-card class to vendor cards
    const vendorCards = document.querySelectorAll('.card, [class*="overflow-hidden"]');
    vendorCards.forEach(card => {
      if (card.querySelector('img')) {
        card.classList.add('vendor-card');
        
        // Find image and add vendor-card-image class
        const image = card.querySelector('img');
        if (image) {
          image.classList.add('vendor-card-image');
        }
        
        // Find info container and add vendor-card-info class
        const infoContainer = card.querySelector('[class*="p-4"], [class*="p-6"]');
        if (infoContainer) {
          infoContainer.classList.add('vendor-card-info');
          
          // Find title and add vendor-card-name class
          const title = infoContainer.querySelector('h3');
          if (title) {
            title.classList.add('vendor-card-name');
          }
          
          // Find details and add vendor-card-details class
          const details = infoContainer.querySelectorAll('div:not([class*="flex"])');
          details.forEach(detail => {
            detail.classList.add('vendor-card-details');
          });
          
          // Find action buttons and add vendor-card-actions class
          const actions = infoContainer.querySelector('[class*="flex gap-"]');
          if (actions) {
            actions.classList.add('vendor-card-actions');
            
            // Find buttons and add vendor-card-button class
            const buttons = actions.querySelectorAll('button');
            buttons.forEach(button => {
              button.classList.add('vendor-card-button');
            });
          }
        }
      }
    });
    
    // Add send-button class to send button
    const sendButtons = document.querySelectorAll('[class*="rounded-lg p-0"]');
    sendButtons.forEach(button => {
      if (button.querySelector('svg')) {
        button.classList.add('send-button');
      }
    });
  }, 500);
}

// Run when page loads
window.addEventListener('DOMContentLoaded', applyMobileClasses);

// Run when URL changes (for SPA)
window.addEventListener('popstate', applyMobileClasses);

// Set up a mutation observer to watch for changes in the DOM
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    applyMobileClasses();
  }
}).observe(document, {subtree: true, childList: true});

// Run the function periodically to catch dynamically added elements
setInterval(applyMobileClasses, 3000); 