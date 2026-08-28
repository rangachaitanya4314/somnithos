import React from 'react';
import { ShieldAlert, BookCheck, FileText, CheckCircle2 } from 'lucide-react';

export const EvidenceTrustBanner: React.FC = () => {
  return (
    <section className="evidence-trust-section">
      <div className="container">
        <div className="trust-banner-card">
          <div className="trust-banner-badge">
            <ShieldAlert size={16} />
            <span>OUR SCIENTIFIC & HISTORICAL COMMITMENT</span>
          </div>

          <h2 className="trust-banner-heading">
            We Never Invent Factual Claims.
          </h2>

          <p className="trust-banner-sub">
            The internet is flooded with generic dream dictionaries making baseless predictions and pseudoscientific assertions. Somnithos was built on a radically different principle: <strong>Epistemic Transparency</strong>.
          </p>

          <div className="trust-pillars-grid">
            <div className="trust-pillar">
              <div className="pillar-icon-box">
                <BookCheck size={20} />
              </div>
              <h4 className="pillar-title">No Regional Stereotypes</h4>
              <p className="pillar-text">
                We never say &quot;African cultures believe&quot; or &quot;Indian culture believes.&quot; We identify the exact community, specific text, geographical location, and historical period.
              </p>
            </div>

            <div className="trust-pillar">
              <div className="pillar-icon-box">
                <FileText size={20} />
              </div>
              <h4 className="pillar-title">&quot;Why Am I Seeing This?&quot;</h4>
              <p className="pillar-text">
                Every factual claim includes a first-class source viewer showing the author, primary manuscript accession number or DOI, and translated supporting passage.
              </p>
            </div>

            <div className="trust-pillar">
              <div className="pillar-icon-box">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="pillar-title">&quot;No Reliable Source Found&quot;</h4>
              <p className="pillar-text">
                If an element lacks authenticated historical or scientific research, we openly state &quot;No reliable source found&quot; rather than hallucinating a fake answer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
