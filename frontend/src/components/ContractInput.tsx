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

  const tabBase = 'px-4 py-2 text-sm font-medium transition-colors cursor-pointer'
  const activeTab = `${tabBase} text-arc-blue border-b-2 border-arc-blue`
  const inactiveTab = `${tabBase} text-gray-500 border-b-2 border-transparent hover:text-gray-300`

  return (
    <div className="rounded-lg border border-[#1e1e2e] bg-[#0d0d16] overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#1e1e2e]">
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
            className="mono w-full rounded bg-[#111118] text-sm text-gray-300 p-3 resize-none outline-none border border-[#1e1e2e] focus:border-arc-blue/50 transition-colors placeholder:text-gray-600"
            rows={12}
            placeholder={SAMPLE_CONTRACT}
            value={value.source}
            onChange={e => onChange({ ...value, source: e.target.value })}
            spellCheck={false}
          />
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              className="mono w-full rounded bg-[#111118] text-sm text-gray-300 p-3 outline-none border border-[#1e1e2e] focus:border-arc-blue/50 transition-colors placeholder:text-gray-600"
              placeholder="0x..."
              value={value.address}
              onChange={e => onChange({ ...value, address: e.target.value })}
              spellCheck={false}
            />

            <select
              className="w-full rounded bg-[#111118] text-sm text-gray-300 p-3 outline-none border border-[#1e1e2e] focus:border-arc-blue/50 transition-colors"
              value={value.chain}
              onChange={e => onChange({ ...value, chain: e.target.value })}
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
