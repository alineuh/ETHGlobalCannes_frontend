import type { ContractInput, ContractInputMode } from '../types'

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok);
        balances[msg.sender] -= amount;
    }
}`

interface Props {
  value: ContractInput
  onChange: (input: ContractInput) => void
}

const CHAINS = ['Arc Testnet', 'Ethereum Mainnet', 'Base']

function isValidAddress(addr: string): boolean {
  return addr.startsWith('0x') && addr.length === 42
}

export function ContractInput({ value, onChange }: Props) {
  const setMode = (mode: ContractInputMode) => onChange({ ...value, mode })

  const tabBase = 'px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2'
  const activeTab = `${tabBase} text-white border-blue-500`
  const inactiveTab = `${tabBase} text-gray-500 border-transparent hover:text-gray-300`

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid #1a1a2e', background: '#0a0a14' }}
    >
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid #1a1a2e' }}>
        <button
          className={value.mode === 'source' ? activeTab : inactiveTab}
          onClick={() => setMode('source')}
          type="button"
        >
          Paste Source
        </button>
        <button
          className={value.mode === 'address' ? activeTab : inactiveTab}
          onClick={() => setMode('address')}
          type="button"
        >
          On-Chain Address
        </button>
      </div>

      <div className="p-4">
        {value.mode === 'source' ? (
          <textarea
            className="mono w-full resize-none outline-none transition-all duration-200"
            rows={12}
            placeholder={SAMPLE_CONTRACT}
            value={value.source}
            onChange={e => onChange({ ...value, source: e.target.value })}
            spellCheck={false}
            style={{
              background: '#050508',
              border: '1px solid #1a1a2e',
              borderLeft: '3px solid #1e3a5f',
              borderRadius: '8px',
              padding: '12px 12px 12px 16px',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#a8b8d8',
              caretColor: '#3b82f6',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.2)'
              e.currentTarget.style.borderLeftColor = '#3b82f6'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#1a1a2e'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderLeftColor = '#1e3a5f'
            }}
          />
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm select-none">🔍</span>
              <input
                type="text"
                className="mono w-full outline-none transition-all duration-200"
                placeholder="0x..."
                value={value.address}
                onChange={e => onChange({ ...value, address: e.target.value })}
                spellCheck={false}
                style={{
                  background: '#050508',
                  border: '1px solid #1a1a2e',
                  borderRadius: '8px',
                  padding: '12px 12px 12px 2.25rem',
                  fontSize: '13px',
                  color: '#a8b8d8',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.2)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#1a1a2e'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <select
              className="w-full outline-none transition-all duration-200"
              value={value.chain}
              onChange={e => onChange({ ...value, chain: e.target.value })}
              style={{
                background: '#050508',
                border: '1px solid #1a1a2e',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                color: '#a8b8d8',
              }}
            >
              {CHAINS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {value.address.length > 0 && (
              isValidAddress(value.address) ? (
                <p className="text-xs text-green-400">
                  ✓ Will fetch verified source from block explorer
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Enter a valid contract address
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
