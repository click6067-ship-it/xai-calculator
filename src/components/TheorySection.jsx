import React, { useMemo } from 'react';
import katex from 'katex';

function Latex({ math, display = false }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<span style="color:#ef4444">LaTeX error</span>`;
    }
  }, [math, display]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function Section({ number, title, children }) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
        <span className="text-cyan-500 font-mono text-xs bg-cyan-950/30 w-6 h-6 rounded-lg flex items-center justify-center border border-cyan-800/30">
          {number}
        </span>
        {title}
      </h3>
      <div className="space-y-3 text-[13px] text-gray-400 leading-relaxed ml-8">
        {children}
      </div>
    </div>
  );
}

function MathBlock({ children }) {
  return (
    <div className="bg-gray-800/40 rounded-xl p-4 my-3 overflow-x-auto border border-gray-700/20">
      {children}
    </div>
  );
}

export default function TheorySection() {
  return (
    <section className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6 animate-fade-in">
      <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-8">
        Mathematical Theory: Algorithm &rarr; Weight Translation
      </h2>

      <Section number="1" title="The Core Insight">
        <p>
          A Transformer layer computes:{' '}
          <Latex math="x_{\text{out}} = x + \text{MLP}\!\left(\text{LN}\!\left(x + \text{Attn}\!\left(\text{LN}(x)\right)\right)\right)" />
        </p>
        <p>
          If we know the exact algorithm (addition with carry), we can
          analytically solve for every weight matrix. No optimization needed
          &mdash; the weights are a{' '}
          <em className="text-cyan-300">direct encoding</em> of the algorithm.
        </p>
      </Section>

      <Section number="2" title="Embedding: Digit → Vector">
        <p>
          Each digit <Latex math="d \in \{0, 1, \ldots, 9\}" /> maps to a
          5-dimensional vector:
        </p>
        <MathBlock>
          <Latex
            math="\text{Embed}(d) = \begin{bmatrix} 100 \\ d \\ 0 \\ 0 \\ 0 \end{bmatrix}^T"
            display
          />
        </MathBlock>
        <p>
          Dimension 0 is a constant &ldquo;presence flag&rdquo; used by Q/K for
          attention routing. Dimension 1 carries the digit value. Dimensions 2-4
          are reserved for intermediate computations during the forward pass.
        </p>
      </Section>

      <Section number="3" title="Layer 0 Attention: Positional Pairing">
        <p>
          The attention score between query position{' '}
          <Latex math="i" /> and key position <Latex math="j" /> is:
        </p>
        <MathBlock>
          <Latex
            math="\text{score}(i,j) = \frac{\left(R_i \cdot W_Q \cdot x_i\right)^T \!\cdot\! \left(R_j \cdot W_K \cdot x_j\right)}{\sqrt{d_k}}"
            display
          />
        </MathBlock>
        <p>
          where <Latex math="R_i" /> is the RoPE rotation matrix at position{' '}
          <Latex math="i" />. The Q and K projection weights are chosen so that:
        </p>
        <MathBlock>
          <Latex
            math="\text{score}(n,\; n+12) \gg \text{score}(n,\; m) \quad \forall\; m \neq n+12"
            display
          />
        </MathBlock>
        <p>
          This creates a hard 1-to-1 mapping: digit <Latex math="a_n" />{' '}
          exclusively attends to digit <Latex math="b_n" />. The Value
          projection extracts the digit value, and the Output projection routes
          it to the sum channel:
        </p>
        <MathBlock>
          <Latex
            math="x^{(2)}_n \leftarrow a_n + b_n \quad \text{(digit sum before carry)}"
            display
          />
        </MathBlock>
      </Section>

      <Section number="4" title="MLP as a Logic Gate">
        <p>
          The MLP uses SwiGLU activation:{' '}
          <Latex math="\text{MLP}(x) = W_{\text{down}} \cdot \left(\sigma(W_{\text{gate}} \cdot x) \odot W_{\text{up}} \cdot x\right)" />
        </p>
        <p>
          Layer 1&rsquo;s MLP implements the carry logic. The gate weights
          create a sharp threshold at sum = 10:
        </p>
        <MathBlock>
          <Latex
            math="\text{carry}_n = \begin{cases} 1 & \text{if } a_n + b_n + \text{carry}_{n-1} \geq 10 \\ 0 & \text{otherwise} \end{cases}"
            display
          />
        </MathBlock>
        <p>
          The down projection{' '}
          <Latex math="W_{\text{down}}^{(2,:)} = [1,\; -10,\; +10]" />{' '}
          implements modular arithmetic:
        </p>
        <ul className="list-none space-y-1.5 ml-2">
          <li className="flex items-start gap-2">
            <code className="text-green-400 bg-gray-800/50 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
              +1
            </code>
            <span>Pass through the raw sum</span>
          </li>
          <li className="flex items-start gap-2">
            <code className="text-red-400 bg-gray-800/50 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
              -10
            </code>
            <span>Subtract 10 when carry fires (mod 10 operation)</span>
          </li>
          <li className="flex items-start gap-2">
            <code className="text-cyan-400 bg-gray-800/50 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
              +10
            </code>
            <span>Propagate carry signal to the next position</span>
          </li>
        </ul>
      </Section>

      <Section number="5" title="The 343-Parameter Budget">
        <div className="bg-gray-800/40 rounded-xl p-4 my-2 font-mono text-[11px] overflow-x-auto border border-gray-700/20">
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700/50">
                <th className="text-left py-1.5 font-medium">Component</th>
                <th className="text-right py-1.5 font-medium">Shape</th>
                <th className="text-right py-1.5 font-medium">Params</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr>
                <td className="py-1">Embedding</td>
                <td className="text-right">10 x 5</td>
                <td className="text-right text-gray-300">50</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: Q proj</td>
                <td className="text-right">4 x 5</td>
                <td className="text-right text-gray-300">40</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: K proj</td>
                <td className="text-right">2 x 5</td>
                <td className="text-right text-gray-300">20</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: V proj</td>
                <td className="text-right">2 x 5</td>
                <td className="text-right text-gray-300">20</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: O proj</td>
                <td className="text-right">5 x 4</td>
                <td className="text-right text-gray-300">40</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: Q/K norm</td>
                <td className="text-right">2 + 2</td>
                <td className="text-right text-gray-300">8</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: Gate proj</td>
                <td className="text-right">3 x 5</td>
                <td className="text-right text-gray-300">30</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: Up proj</td>
                <td className="text-right">3 x 5</td>
                <td className="text-right text-gray-300">30</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: Down proj</td>
                <td className="text-right">5 x 3</td>
                <td className="text-right text-gray-300">30</td>
              </tr>
              <tr>
                <td className="py-1">Layer x2: LayerNorm x2</td>
                <td className="text-right">5</td>
                <td className="text-right text-gray-300">20</td>
              </tr>
              <tr>
                <td className="py-1">Final norm</td>
                <td className="text-right">5</td>
                <td className="text-right text-gray-300">5</td>
              </tr>
              <tr>
                <td className="py-1">LM Head</td>
                <td className="text-right">10 x 5</td>
                <td className="text-right text-gray-300">50</td>
              </tr>
              <tr className="text-amber-400 border-t border-gray-700/50 font-bold">
                <td className="py-1.5">Total</td>
                <td />
                <td className="text-right">343</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section number="6" title="Why This Matters">
        <p>
          This demonstrates that Transformers are not inherently &ldquo;black
          boxes.&rdquo; When the target algorithm is fully understood, we can{' '}
          <em className="text-cyan-300">compile</em> it directly into the
          architecture &mdash; achieving perfect accuracy with zero training
          data, zero compute, and zero approximation error.
        </p>
        <p>
          The implication: for any algorithm expressible as attention + MLP,
          there exists a <em className="text-cyan-300">minimal weight configuration</em>{' '}
          that implements it exactly. The 343 parameters here are not
          &ldquo;learned features&rdquo; &mdash; they are the{' '}
          <em className="text-cyan-300">compiled bytecode</em> of the addition
          algorithm, running on Transformer hardware.
        </p>
      </Section>
    </section>
  );
}
