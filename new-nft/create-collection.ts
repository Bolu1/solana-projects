
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

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "My Collection",
  symbol: "MC",
  uri: "https://res.cloudinary.com/dizurs95a/raw/upload/v1756975191/test-nft_lwxw10.json",
  sellerFeeBasisPoints: percentAmount(3),
  isCollection: true,
});

console.log("Sending transaction...");
const result = await transaction.sendAndConfirm(umi);
console.log("Transaction confirmed");

console.log(
  `Created collection NFT! Mint address: ${collectionMint.publicKey}`
);
console.log(
  "Explorer link:", 
  getExplorerLink(
    "address", 
    collectionMint.publicKey.toString(), 
    "devnet"
  )
);

try {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  const createdCollectionNft = await fetchDigitalAsset(
    umi, 
    collectionMint.publicKey
  );
  console.log("Successfully fetched digital asset metadata");
  console.log("Digital asset details:", createdCollectionNft.mint.publicKey);
} catch (error) {
  console.log("Note: Digital asset fetch failed (this is normal immediately after creation)");
  console.log("The collection was still created successfully - check the explorer link above");
}
console.log(
  "Explorer link:", 
  getExplorerLink(
    "address", 
    collectionMint.publicKey.toString(), 
    "devnet"
  )
);

console.log(`Create collection, address: ${getExplorerLink}`)