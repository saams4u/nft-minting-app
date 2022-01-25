
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { TwitterShareButton, TwitterIcon, 
         FacebookShareButton, FacebookIcon, 
         LinkedinShareButton, LinkedinIcon,
         RedditShareButton, RedditIcon } from "react-share";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 400px;
  @media (max-width: 600px) {
    width: 200px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;



function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, objectFit: "cover" }}
        image={"/images/bg.jpg"}
      >
        {/* <a href={CONFIG.MARKETPLACE_LINK}>
          <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        </a> */}
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"avatars"} src={"/images/avatars.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 36,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
                fontSize: 30,
                fontWeight: "bold"  
              }}
            >
              <StyledLogo alt={"logo"} src={"/images/logo.png"} />
              {/* Welcome to Guild Fighters! */}
            </s.TextDescription><br></br>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 18,
                color: "var(--accent-text)",
              }}      
            >
              <p>Guild Fighters is a fantasy-based NFT collection with a medieval spin. It began as a personal hobby and evolved into a more serious enterprise. I put together the entire base and trait layers to generate these unique digital collectibles. I devised an algorithm that sums and averages the properties (Battle Club, Jade Sword, etc.) of each NFT a value based on the rarity level of each trait - this final value represents the product of the base price and the average rarity factor. As a quick aside, I also used the Yahoo Finance API to query real-time data on the current Ethereum price and used this dynamic (and volatile) value to calculate the price listings. Lastly, I created a method to ascribe certain statistics (speed, attack, etc.) to each fighter based on rarity affiliation. It took a while to tweak this in Python code but I finally managed to produce the desired results.</p><br></br>
              <p>Check the roadmap and browse these items on OpenSea and Rarible! For OpenSea, the goal is to list 10,000 randomly generated NFTs for sale with properties and statistics attributes. On Rarible, the items are listed in an unlimited auction and are currently open for bids. Ping me on social media for any questions, advice, or future collaborations. Be sure to join the Discord and Reddit communities to share your thoughts and ideas!</p>
            </s.TextDescription><br></br><br></br>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {/* {CONFIG.CURRENT_SUPPLY} / {CONFIG.MAX_SUPPLY} */}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {/* {truncate(CONFIG.CONTRACT_ADDRESS, 15)} */}
              </StyledLink>
            </s.TextDescription>
            <span
              style={{
                textAlign: "center",
              }}
            >
              <StyledButton
                onClick={(e) => {
                  window.open("/roadmap.pdf", "_blank");
                }}
                style={{
                  margin: "5px",
                  backgroundColor: "green",
                  height: 50,
                  width: 80,
                  fontSize: 12
                }}
              >
                Roadmap
              </StyledButton>
              <StyledButton
                style={{
                  margin: "5px",
                  backgroundColor: "blue",
                  height: 50,
                  width: 80,
                  fontSize: 12
                }}
                onClick={(e) => {
                  window.open("https://opensea.io/collection/guildfighters", "_blank");
                }}
              >
                OpenSea
              </StyledButton>
              <StyledButton
                style={{
                  margin: "5px",
                  backgroundColor: "black",
                  height: 50,
                  width: 80,
                  fontSize: 12
                }}
                onClick={(e) => {
                  window.open("https://rarible.com/saams4u", "_blank");
                }}
              >
                Rarible
              </StyledButton>
              <StyledButton
                style={{
                  margin: "5px",
                  backgroundColor: "purple",
                  height: 50,
                  width: 80,
                  fontSize: 12
                }}
                onClick={(e) => {
                  window.open("https://discord.gg/awhj2VwA", "_blank");
                }}
              >
                Discord
              </StyledButton>
              <StyledButton
                style={{
                  margin: "5px",
                  backgroundColor: "red",
                  height: 50,
                  width: 80,
                  fontSize: 12
                }}
                onClick={(e) => {
                  window.open("https://www.reddit.com/r/GuildFighters/", "_blank");
                }}
              >
                Reddit
              </StyledButton>  
              <StyledButton
                style={{
                  margin: "5px",
                  backgroundColor: "grey",
                  height: 50,
                  width: 80,
                  fontSize: 12
                }}
                onClick={(e) => {
                  window.open("https://nftcalendar.io/event/guild-fighters/", "_blank");
                }}
              >
                NFT Calendar
              </StyledButton>              
              <br></br><br></br><br></br><br></br>
              <s.TextTitle style={{ fontSize: 12 }}>
                Share on Social Media:
              </s.TextTitle>
              <br></br>
              {/* <s.TextTitle style={{ fontSize: 12 }}>
                Share on Twitter:
              </s.TextTitle> */}
              <TwitterShareButton 
                  url="https://www.guildfighters.com" 
                  title="Check out the Guild Fighters NFT collection!"
                  className="share-button">
                  <TwitterIcon
                    size={64}
                    round={true} />
              </TwitterShareButton>&nbsp;&nbsp;&nbsp;&nbsp;
              {/* <s.TextTitle style={{ fontSize: 12 }}>
                Share on Facebook:
              </s.TextTitle> */}
              <FacebookShareButton 
                  url="https://www.guildfighters.com" 
                  title="Check out the Guild Fighters NFT collection!"
                  className="share-button">
                  <FacebookIcon
                    size={64}
                    round={true} />
              </FacebookShareButton>&nbsp;&nbsp;&nbsp;&nbsp;
              {/* <s.TextTitle style={{ fontSize: 12 }}>
                Share on LinkedIn:
              </s.TextTitle> */}
              <LinkedinShareButton 
                  url="https://www.guildfighters.com" 
                  title="Check out the Guild Fighters NFT collection!"
                  className="share-button">
                  <LinkedinIcon
                    size={64}
                    round={true} />
              </LinkedinShareButton>&nbsp;&nbsp;&nbsp;&nbsp;
              {/* <s.TextTitle style={{ fontSize: 12 }}>
                Share on Reddit:
              </s.TextTitle> */}
              <RedditShareButton 
                  url="https://www.guildfighters.com" 
                  title="Check out the Guild Fighters NFT collection!"
                  className="share-button">
                  <RedditIcon
                    size={64}
                    round={true} />
              </RedditShareButton>
            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={"https://opensea.io/collection/guildfighters"}>
                  OpenSea
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  {/* 1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}. */}
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  {/* Excluding gas fees. */}
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {/* Connect to the {CONFIG.NETWORK.NAME} network */}
                    </s.TextDescription>
                    <s.SpacerSmall />
                    {/* <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton> */}
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"avatars"}
              src={"/images/avatars.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        {/* <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container> */}
      </s.Container>
    </s.Screen>
  );
}

export default App;
