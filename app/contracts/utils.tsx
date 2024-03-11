import { ethers } from 'ethers'
// import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function getContractExpiration({
    provider, 
    contractAddress,
}: {
    provider: ethers.BrowserProvider,
    contractAddress: string
}) {
    console.log("Getting expiration for contract", contractAddress)
    const contractExpiration = new ethers.Contract(
        contractAddress,
        ['function expiration() public view returns (uint256)'],
        provider
    );
    return contractExpiration.expiration();
}

export async function verifySignerIsSender({
    provider, 
    contractAddress, 
    signer
}: {
    provider: ethers.BrowserProvider,
    contractAddress: string,
    signer: string
}) {
    const contractSender = new ethers.Contract(
        contractAddress,
        ['function sender() public view returns (address)'],
        provider
    );
    const sender = await contractSender.sender();
    if (signer.toLowerCase() === sender.toLowerCase()) {
        return true;
    }
    return false;
}

export async function getContractRecipient({
    provider, 
    contractAddress,
}: {
    provider: ethers.BrowserProvider,
    contractAddress: string
}) {
    const contractRecipient = new ethers.Contract(
        contractAddress,
        ['function recipient() public view returns (address)'],
        provider
    );
    return contractRecipient.recipient();
}

export function convertETHtoWei(amountETH: number) {
    return amountETH * 1000000000000000000;
}