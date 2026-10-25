// exportItineraryPdf.js — Clean HTML & CSS Printable Report Generator with Direct PDF Download
export function exportItineraryPdf(trip) {
  if (!trip || !trip.days) {
    alert("Please generate and save an itinerary first before exporting to PDF.");
    return;
  }

  // Create a clean printable window / HTML document
  const printWindow = window.open('', '_blank');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nihon Travel Itinerary</title>
      <!-- Include html2pdf.js CDN for direct PDF downloading -->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600&display=swap');
        
        body {
          font-family: 'DM Sans', sans-serif;
          color: #292b27;
          background: #ffffff;
          margin: 0;
          padding: 40px;
          line-height: 1.6;
        }
        @page {
          margin: 15mm;
        }
        .no-print {
          display: block;
        }
        .action-bar {
          background: #f8f7f2;
          border: 1px solid #e6e3da;
          padding: 15px 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 6px;
        }
        .action-bar p {
          margin: 0;
          font-size: 13px;
          color: #555750;
        }
        .save-btn {
          background: #292b27;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .save-btn:hover {
          background: #b43b32;
        }
        .header {
          border-bottom: 2px solid #b43b32;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .brand {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #b43b32;
          text-transform: uppercase;
        }
        h1 {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          margin: 8px 0 4px;
          font-weight: 600;
          color: #1a1c18;
        }
        .meta-subtitle {
          font-size: 12px;
          color: #555750;
        }
        
        /* Emergency Helpline Box Styles */
        .emergency-box {
          background: #fdf3f2;
          border: 1.5px solid #b43b32;
          padding: 16px 20px;
          margin-bottom: 25px;
          page-break-inside: avoid;
          border-radius: 4px;
        }
        .emergency-box h3 {
          margin: 0 0 10px;
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          color: #b43b32;
        }
        .emergency-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 11px;
          color: #222222;
        }
        .emergency-item strong {
          color: #111111;
        }

        .glance-card {
          background: #f8f7f2;
          border: 1px solid #e6e3da;
          padding: 18px 20px;
          margin-bottom: 25px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .glance-item h4 {
          margin: 0 0 4px;
          font-size: 10px;
          letter-spacing: 1.2px;
          color: #555750;
          text-transform: uppercase;
        }
        .glance-item p {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: #1a1c18;
        }
        .notice-banner {
          background: #fdf3f0;
          border: 1px solid #f0c8be;
          color: #b43b32;
          padding: 10px 14px;
          font-size: 11.5px;
          font-weight: 600;
          margin-bottom: 25px;
        }
        .day-section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        .day-title {
          background: #292b27;
          color: #ffffff;
          padding: 10px 16px;
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          margin-bottom: 12px;
          font-weight: 600;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .slot-box {
          background: #fcfbfa;
          border: 1px solid #e6e3da;
          padding: 14px 16px;
          margin-bottom: 10px;
        }
        .slot-time {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #b43b32;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .slot-title {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          margin: 0 0 4px;
          color: #1a1c18;
          font-weight: 600;
        }
        .slot-desc {
          font-size: 12px;
          color: #292b27;
          margin: 0 0 8px;
          font-weight: 400;
        }
        .food-badge {
          display: inline-block;
          background: #f1e5df;
          color: #b43b32;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 4px;
        }
        .budget-heading {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          margin: 30px 0 12px;
          color: #1a1c18;
        }
        .budget-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          page-break-inside: avoid;
        }
        .budget-table th, .budget-table td {
          border: 1px solid #e6e3da;
          padding: 10px 14px;
          font-size: 12px;
          text-align: left;
          color: #292b27;
        }
        .budget-table th {
          background: #292b27;
          color: #ffffff;
          font-weight: 600;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .budget-table tr:nth-child(even) {
          background: #f8f7f2;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>
    <body>
      <div id="pdf-content">
        <!-- Top Action Bar with Direct Download Button -->
        <div class="action-bar no-print" id="action-bar">
          <p>✨ Your travel itinerary is ready. Click below to download directly as a PDF.</p>
          <button class="save-btn" onclick="downloadPDF()">📥 Save as PDF</button>
        </div>

        <div class="header">
          <div class="brand">Nihon (日本) · Japan Travel Companion</div>
          <h1>${trip.profile?.destination || "Golden Route"} Itinerary</h1>
          <div class="meta-subtitle">Created on ${new Date(trip.createdAt || Date.now()).toLocaleDateString()}</div>
        </div>

        <!-- Emergency Helpline Numbers Box -->
        <div class="emergency-box">
          <h3>🚨 Japan Emergency & Tourist Helpline Numbers</h3>
          <div class="emergency-grid">
            <div class="emergency-item">
              <strong>1. Standard Core Emergency Numbers (Toll Free):</strong><br>
              • Police (Accidents, Crime, Stolen Items): <b>110</b><br>
              • Fire Department & Medical Ambulance: <b>119</b><br>
              • Japan Coast Guard (Maritime): <b>118</b>
            </div>
            <div class="emergency-item">
              <strong>2. Tourist & Non-Emergency Services:</strong><br>
              • JNTO Visitor Hotline (24/7): <b>050-3816-2787</b> (+81-50-3816-2787)<br>
              • Medical Triage Advice: <b>#7119</b> (Unsure of ambulance)<br>
              • Japan Helpline (24/7 English): <b>0570-000-911</b>
            </div>
          </div>
        </div>

        <div class="glance-card">
          <div class="glance-item">
            <h4>Travellers</h4>
            <p>${trip.profile?.travellers || 2} Person(s)</p>
          </div>
          <div class="glance-item">
            <h4>Duration</h4>
            <p>${trip.profile?.duration || trip.days.length} Days</p>
          </div>
          <div class="glance-item">
            <h4>Travel Pace</h4>
            <p>${trip.profile?.pace || "Balanced"}</p>
          </div>
          <div class="glance-item">
            <h4>Dietary Profile</h4>
            <p>${trip.profile?.dietary || "Vegetarian"}</p>
          </div>
          <div class="glance-item">
            <h4>Budget Tier</h4>
            <p>${trip.budgetSummary?.tierName || "Balanced Experience"}</p>
          </div>
          <div class="glance-item">
            <h4>Total Est. Budget</h4>
            <p style="color: #b43b32;">¥${trip.budgetSummary?.totalJPY?.toLocaleString() || "0"}</p>
          </div>
        </div>

        <div class="notice-banner">
          <strong>IMPORTANT NOTE:</strong> Your trip budget includes food, transportation, attractions, and activities. Accommodation is excluded.
        </div>

        ${trip.days.map(day => `
          <div class="day-section">
            <div class="day-title">Day ${day.day}: ${day.theme} (${day.city} · ${day.area})</div>
            
            <div class="slot-box">
              <div class="slot-time">Morning · ${day.morning.time || "09:00 AM"}</div>
              <div class="slot-title">${day.morning.title}</div>
              <div class="slot-desc">${day.morning.desc}</div>
              ${day.transit1 ? `<div style="font-size:11.5px; color:#444; margin-bottom:6px;"><i>Transit:</i> ${day.transit1.mode} (${day.transit1.detail} ~${day.transit1.timeMin} min · ¥${day.transit1.costJPY})</div>` : ''}
              ${day.food?.lunch ? `<div class="food-badge">Lunch: ${day.food.lunch.name} (${day.food.lunch.priceRange}) — ${day.food.lunch.recommendedDishes}</div>` : ''}
            </div>

            <div class="slot-box">
              <div class="slot-time">Afternoon · ${day.afternoon.time || "01:30 PM"}</div>
              <div class="slot-title">${day.afternoon.title}</div>
              <div class="slot-desc">${day.afternoon.desc}</div>
              ${day.transit2 ? `<div style="font-size:11.5px; color:#444;"><i>Transit:</i> ${day.transit2.mode} (${day.transit2.detail} ~${day.transit2.timeMin} min · ¥${day.transit2.costJPY})</div>` : ''}
            </div>

            <div class="slot-box">
              <div class="slot-time">Evening · ${day.evening.time || "05:00 PM"}</div>
              <div class="slot-title">${day.evening.title}</div>
              <div class="slot-desc">${day.evening.desc}</div>
              ${day.food?.dinner ? `<div class="food-badge">Dinner: ${day.food.dinner.name} (${day.food.dinner.priceRange}) — ${day.food.dinner.recommendedDishes}</div>` : ''}
            </div>
          </div>
        `).join('')}

        <div class="budget-heading">Estimated Budget Breakdown</div>
        <table class="budget-table">
          <tr>
            <th>Category</th>
            <th>Estimated JPY (¥)</th>
            <th>Estimated INR (₹)</th>
            <th>Share</th>
          </tr>
          ${trip.budgetSummary?.categories?.map(cat => `
            <tr>
              <td><b>${cat.label}</b></td>
              <td>¥${cat.jpy.toLocaleString()}</td>
              <td>₹${cat.inr.toLocaleString()}</td>
              <td><b>${cat.share}</b></td>
            </tr>
          `).join('')}
        </table>
      </div>

      <script>
        function downloadPDF() {
          const element = document.getElementById('pdf-content');
          const actionBar = document.getElementById('action-bar');
          
          // Temporarily hide the top action bar so it doesn't appear in the downloaded PDF
          actionBar.style.display = 'none';

          const options = {
            margin:       10,
            filename:     'Nihon_Travel_Itinerary.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          html2pdf().from(element).set(options).save().then(() => {
            // Restore action bar after download starts
            actionBar.style.display = 'flex';
          });
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}