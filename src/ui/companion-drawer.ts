/**
 * PRACTICAL TRAVEL COMPANION & DRAWER
 * Transit guidelines, safety emergency protocols, local etiquette & QR sharing
 */

export function renderPracticalDrawer(): string {
  return `
    <div class="drawer-backdrop" id="practical-drawer-backdrop" aria-hidden="true">
      <div class="drawer-panel" id="practical-drawer-panel" role="dialog" aria-label="Practical Travel & Safety Guide">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;border-bottom:1px solid var(--line);padding-bottom:16px">
          <div>
            <span class="badge-apple-pill" style="color:var(--ac);border-color:rgba(173,92,255,0.3);margin-bottom:6px">
              SPEAKER & GUEST BRIEFING
            </span>
            <h2 style="font-size:22px;font-weight:900;color:var(--tx)">Practical Transit & Safety Companion</h2>
          </div>
          <button class="btn-apple-icon" id="btn-close-drawer" aria-label="Close Guide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style="display:flex;flex-direction:column;gap:24px">
          <!-- 1. Airport Transit -->
          <div class="card-apple-glass" style="padding:18px 20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:20px">✈️</span>
              <h4 style="font-size:16px;font-weight:800;color:var(--tx)">Jolly Grant Airport (DED) Transit</h4>
            </div>
            <p style="font-size:13px;color:var(--t2);line-height:1.5">
              Located 32 km east of Graphic Era University. Travel time is typically 50–70 minutes depending on Rispana bridge traffic.
            </p>
            <div style="margin-top:10px;font-size:12.5px;color:var(--tx);background:var(--sec);padding:10px 14px;border-radius:var(--r-md);border:1px solid var(--line)">
              💡 <b>Airport Taxi Tip:</b> Use the official Government Pre-Paid Taxi Counter inside the arrival terminal. Flat rate to Clement Town / Graphic Era is approximately ₹1,100 – ₹1,300.
            </div>
          </div>

          <!-- 2. Railway & ISBT Transit -->
          <div class="card-apple-glass" style="padding:18px 20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:20px">🚆</span>
              <h4 style="font-size:16px;font-weight:800;color:var(--tx)">Dehradun Railway Station (DDN) & ISBT</h4>
            </div>
            <p style="font-size:13px;color:var(--t2);line-height:1.5">
              • <b>Dehradun Railway Station:</b> 6.8 km to campus (~20 mins by auto/cab). Auto fare: ~₹150–₹250.<br>
              • <b>ISBT Bus Terminal:</b> Just 2.8 km to Graphic Era Bell Road (~10 mins by auto/e-rickshaw). Auto fare: ~₹80–₹120.
            </p>
          </div>

          <!-- 3. Mountain Road Safety & Altitude Advice -->
          <div class="card-apple-glass" style="padding:18px 20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:20px">⛰️</span>
              <h4 style="font-size:16px;font-weight:800;color:var(--tx)">Mountain Roads & Motion Sickness</h4>
            </div>
            <p style="font-size:13px;color:var(--t2);line-height:1.5">
              The road from Rajpur toll to Mussoorie climbs from 900m to 2,000m across 30+ sharp hairpin bends (ghats). If prone to motion sickness:
            </p>
            <ul style="margin:8px 0 0 18px;font-size:12.5px;color:var(--t2);line-height:1.6">
              <li>Take preventative anti-emetic medication 45 minutes before ascending.</li>
              <li>Keep cab windows cracked for fresh pine air; avoid reading on phones during ascent.</li>
              <li>Stop for hot ginger tea and cheese Maggi at the midway Shivalik view shacks.</li>
            </ul>
          </div>

          <!-- 4. Temple & Monastery Dress Etiquette -->
          <div class="card-apple-glass" style="padding:18px 20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:20px">🛕</span>
              <h4 style="font-size:16px;font-weight:800;color:var(--tx)">Monastery & Temple Respect</h4>
            </div>
            <p style="font-size:13px;color:var(--t2);line-height:1.5">
              • <b>Mindrolling Monastery (Buddha Temple):</b> Dress modestly (shoulders and knees covered). Always walk clockwise around the Great Stupa and prayer wheel galleries. Photography inside main prayer halls is restricted.<br>
              • <b>Tapkeshwar Mahadev:</b> Remove shoes before cave sanctum descent. Flash photography is prohibited inside subterranean shrines.
            </p>
          </div>

          <!-- 5. Payment, UPI & Connectivity -->
          <div class="card-apple-glass" style="padding:18px 20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:20px">💳</span>
              <h4 style="font-size:16px;font-weight:800;color:var(--tx)">UPI, Cash & Network Coverage</h4>
            </div>
            <p style="font-size:13px;color:var(--t2);line-height:1.5">
              • UPI (Google Pay, PhonePe, Paytm) works universally across Dehradun and Mussoorie Mall Road.<br>
              • In remote corners of Landour (Upper Sisters' Bazaar) and Chakrata/Tiger Falls, cellular signal may dip. Keep ₹1,000 in emergency physical cash.
            </p>
          </div>

          <!-- 6. Emergency Contacts -->
          <div class="card-apple-glass" style="padding:18px 20px;border-color:rgba(255,100,100,0.3)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:20px">🚨</span>
              <h4 style="font-size:16px;font-weight:800;color:#FF6B6B">Emergency Numbers & Medical Help</h4>
            </div>
            <div style="font-size:13px;color:var(--tx);display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div style="background:var(--sec);padding:8px 12px;border-radius:var(--r-sm)">
                <span style="font-size:11px;color:var(--mu);display:block">Uttarakhand Emergency</span>
                <b>Dial 112</b>
              </div>
              <div style="background:var(--sec);padding:8px 12px;border-radius:var(--r-sm)">
                <span style="font-size:11px;color:var(--mu);display:block">Tourist Police</span>
                <b>1800 180 4145</b>
              </div>
              <div style="background:var(--sec);padding:8px 12px;border-radius:var(--r-sm)">
                <span style="font-size:11px;color:var(--mu);display:block">Max Super Speciality</span>
                <b>0135 719 3000</b>
              </div>
              <div style="background:var(--sec);padding:8px 12px;border-radius:var(--r-sm)">
                <span style="font-size:11px;color:var(--mu);display:block">Graphic Era Infirmary</span>
                <b>Bell Road Gate 1</b>
              </div>
            </div>
          </div>

          <!-- 7. Compact FAQ -->
          <div class="card-apple-glass" style="padding:18px 20px">
            <h4 style="font-size:16px;font-weight:800;color:var(--tx);margin-bottom:12px">Frequently Asked Questions</h4>
            <details style="margin-bottom:10px;cursor:pointer">
              <summary style="font-size:13px;font-weight:700;color:var(--tx)">What should I wear in late October / early November?</summary>
              <p style="font-size:12.5px;color:var(--t2);margin-top:6px;line-height:1.5">
                Dehradun valley is warm and pleasant during the day (22°C–25°C), requiring light casual wear. However, Mussoorie and Landour ridge drop quickly to 12°C–14°C by 5 PM. Pack a medium fleece or down jacket, comfortable walking sneakers, and sunglasses.
              </p>
            </details>
            <details style="margin-bottom:10px;cursor:pointer">
              <summary style="font-size:13px;font-weight:700;color:var(--tx)">Can I drive a rental scooter to Landour?</summary>
              <p style="font-size:12.5px;color:var(--t2);margin-top:6px;line-height:1.5">
                Only experienced hill riders should take two-wheelers up the Rajpur-Mussoorie ghats. Landour's Char Dukan road is extremely narrow with steep 20% gradients. Ensure dual helmets and valid documentation at all times.
              </p>
            </details>
            <details style="cursor:pointer">
              <summary style="font-size:13px;font-weight:700;color:var(--tx)">Why is sunset departure so critical?</summary>
              <p style="font-size:12.5px;color:var(--t2);margin-top:6px;line-height:1.5">
                The Shivalik ghats experience heavy twilight mountain fog and commercial truck traffic after dark. Descending by 5:30 PM ensures crystal-clear visibility, smooth return driving, and zero stress.
              </p>
            </details>
          </div>
        </div>

        <div style="margin-top:32px;text-align:center">
          <button class="scd-btn-3d-secondary" id="btn-close-drawer-bottom" style="width:100%;justify-content:center">
            Close Travel Companion
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initPracticalDrawer(rootEl: HTMLElement) {
  const backdrop = rootEl.querySelector('#practical-drawer-backdrop');
  const panel = rootEl.querySelector('#practical-drawer-panel');
  const closeBtn = rootEl.querySelector('#btn-close-drawer');
  const closeBottomBtn = rootEl.querySelector('#btn-close-drawer-bottom');

  const openDrawer = () => {
    if (backdrop) {
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
    }
  };

  const closeDrawer = () => {
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (closeBottomBtn) closeBottomBtn.addEventListener('click', closeDrawer);

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDrawer();
    });
  }

  // Hook all buttons configured to open the drawer
  rootEl.querySelectorAll('#btn-open-transit-drawer, #btn-practical-drawer-trigger').forEach(btn => {
    btn.addEventListener('click', openDrawer);
  });

  return { openDrawer, closeDrawer };
}
