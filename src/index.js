const { ethers } = require('ethers');

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
];

module.exports.onRpcRequest = async ({ origin, request }) => {
  if (request.method !== 'batchTransfer') {
    throw new Error('Unsupported method');
  }

  const { recipient, transfers } = request.params;

  if (!ethers.utils.isAddress(recipient)) {
    throw new Error('Invalid recipient address');
  }

  if (!Array.isArray(transfers)) {
    throw new Error('Invalid transfers array');
  }

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const txs = [];

  for (const transfer of transfers) {
    const { tokenAddress, amount } = transfer;

    if (!ethers.utils.isAddress(tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenAddress}`);
    }

    if (!ethers.utils.isHexString(amount) && isNaN(amount)) {
      throw new Error(`Invalid amount for token ${tokenAddress}`);
    }

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await tokenContract.transfer(recipient, amount);
      txs.push(tx);
    } catch (error) {
      console.error(`Error transferring token ${tokenAddress}:`, error);
      throw new Error(`Error transferring token ${tokenAddress}`);
    }
  }

  return {
    status: 'success',
    txs,
  };
};
