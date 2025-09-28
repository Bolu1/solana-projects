import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiUser));

console.log("Set up instance for user");

const collectionAddress = publicKey(
  "H1U7C5DfWbjp2NMFLeHeWed8txm5QFiHe9CaYvGZUhcQ"
);

console.log(`creating NFT...`);
await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint,
    name: "My test NFT",
    uri: "https://res.cloudinary.com/dizurs95a/raw/upload/v1756975191/test-nft_lwxw10.json",
    sellerFeeBasisPoints: percentAmount(3),
    collection: {
        key: collectionAddress,
        verified: false
    }
});

console.log(`Confirming transaction NFT...`);


await transaction.sendAndConfirm(umi);

console.log(`Fetching NFT...`);


await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 2 seconds


const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
  
console.log("Created NFT ", createdNft)