<?php
error_reporting(E_ALL ^ E_NOTICE);

$sFeedback = "";
$sUserName = $_POST['UserName'];
$sPassword = $_POST['Password'];
$sUUID = $_POST['UUID'];
$SubmitBid = $_POST['SubmitBid'];
$SubmitMaxBid = $_POST['SubmitMaxBid'];
$AddItemToWatch = $_POST['AddItemToWatch'];
$RemoveItemFromWatch = $_POST['RemoveItemFromWatch'];
$GetItemsList = $_POST['GetItemsList'];
$UpdateUser = $_POST['UpdateUser'];
$SubmitNewUser = $_POST['SubmitNewUser'];
$AuctionUpdate = $_POST['AuctionUpdate'];
$ItemToSave = $_POST['ItemToSave'];




if ($sUserName && $sPassword)
	$sFeedback .= LogIn($sUserName, $sPassword);
else if ($sUUID)
	$sFeedback .= LogInWithUUID($sUUID);
else if ($SubmitBid)
	$sFeedback .= SubmitBid($SubmitBid);
else if ($SubmitMaxBid)
	$sFeedback .= SubmitMaxBid($SubmitMaxBid);
else if ($AddItemToWatch)
	$sFeedback .= AddItemToWatch($AddItemToWatch);
else if ($RemoveItemFromWatch)
	$sFeedback .= RemoveItemFromWatch($RemoveItemFromWatch);
else if ($GetItemsList)
	$sFeedback .= GetItemsList($GetItemsList);
else if ($UpdateUser)
	$sFeedback .= UpdateUser($UpdateUser);
else if ($SubmitNewUser)
	$sFeedback .= AddNewUser($SubmitNewUser);
else if ($AuctionUpdate)
	$sFeedback .= AuctionUpdate($AuctionUpdate);
else if ($ItemToSave)
	$sFeedback .= SaveItem($ItemToSave);

echo $sFeedback;


// Functions

function LogIn($sUserName, $sPassword) {

}

function LogInWithUUID($sUUID) {

}

function SubmitBid($SubmitBid) {
	$objBid = json_decode($SubmitBid);
	$sFileLocation = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objBid->sAuctionID . "/Items/" . $objBid->sItem . ".json";
	$sItem = file_get_contents($sFileLocation);
	$objItem = json_decode($sItem);
	date_default_timezone_set("UTC");
	$RightNow = number_format(microtime(true)*1000,0,'.','');
	if ($objItem->Item->Starts > $RightNow) {
		$objItem->Item->Message = 'Bidding has not yet started for this item';
		$sUpdatedItem = json_encode($objItem);
		return $sUpdatedItem;
	}
	else if ($objItem->Item->Ends < $RightNow) {
		$objItem->Item->Message = 'Bidding has ended for this item';
		$sUpdatedItem = json_encode($objItem);
		return $sUpdatedItem;
	}
	$nBids = count($objItem->Item->BidHistory);
	$sCurrentBid = $objItem->Item->BidHistory[$nBids-1]->Bid;
	$sMinNextBid = $sCurrentBid + $objItem->Item->BidSteps;
	if ($objBid->sAmount >= $sMinNextBid) {
		if ($objBid->sAmount < ($objItem->Item->MaxBid->MaxBid - $objItem->Item->BidSteps)) {
			$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sAmount;
			$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
			$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
			$objItem->Item->BidHistory[$nBids]->Type = "Bid";
			if ($objItem->Item->MaxBid->User !== $objBid->sUUID) { // If you're not the max bidder, up the max bidder's bid
				$objItem->Item->BidHistory[$nBids+1]->Bid = strval($objBid->sAmount + $objItem->Item->BidSteps);
				$objItem->Item->BidHistory[$nBids+1]->User = $objItem->Item->MaxBid->User;
				$objItem->Item->BidHistory[$nBids+1]->Time = $RightNow;
				$objItem->Item->BidHistory[$nBids+1]->Type = "Bid";
			}
			$objItem->Item->Message = ''; // Bid accepted, but raised to $' . (intval ($objItem->Item->BidHistory[$nBids+1]->Bid));
			$sUpdatedItem = json_encode($objItem, JSON_PRETTY_PRINT);
			file_put_contents($sFileLocation, $sUpdatedItem, LOCK_EX);
		}
		else if ($objBid->sAmount <= $objItem->Item->MaxBid->MaxBid - $objItem->Item->BidSteps) {
			$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sAmount;
			$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
			$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
			$objItem->Item->BidHistory[$nBids]->Type = "Bid";
			$objItem->Item->BidHistory[$nBids+1]->Bid = strval($objBid->sAmount + $objItem->Item->BidSteps);
			$objItem->Item->BidHistory[$nBids+1]->User = $objItem->Item->MaxBid->User;
			$objItem->Item->BidHistory[$nBids+1]->Time = $RightNow;
			$objItem->Item->BidHistory[$nBids+1]->Type = "Bid";
			$objItem->Item->Message = ''; // Bid goes to max bidder: $' . (intval ($objItem->Item->BidHistory[$nBids+1]->Bid));
			$sUpdatedItem = json_encode($objItem, JSON_PRETTY_PRINT);
			file_put_contents($sFileLocation, $sUpdatedItem, LOCK_EX);
		}
		else { // if the new bid is bigger than old bid + step
			$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sAmount;
			$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
			$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
			$objItem->Item->BidHistory[$nBids]->Type = "Bid";
			$objItem->Item->Message = ''; // Bid accepted:  $' . $objBid->sAmount;
			$sUpdatedItem = json_encode($objItem, JSON_PRETTY_PRINT);
			file_put_contents($sFileLocation, $sUpdatedItem, LOCK_EX);
		}
	}
	else
		$objItem->Item->Message = "Bid denied:  $" . $objBid->sAmount . " is too low.  This item bids in minimun steps of $" . $objItem->Item->BidSteps;
	$sUpdatedItem = json_encode($objItem);
	return $sUpdatedItem;
}

function SubmitMaxBid($SubmitMaxBid) {
	$objBid = json_decode($SubmitMaxBid);
	$sFileLocation = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objBid->sAuctionID . "/Items/" . $objBid->sItem . ".json";
	$sItem = file_get_contents($sFileLocation);
	$objItem = json_decode($sItem);
	date_default_timezone_set("UTC");
	$RightNow = number_format(microtime(true)*1000,0,'.','');
	if ($objItem->Item->Starts > $RightNow) {
		$objItem->Item->Message = 'Bidding has not yet started for this item';
		$sUpdatedItem = json_encode($objItem);
		return $sUpdatedItem;
	}
	else if ($objItem->Item->Ends < $RightNow) {
		$objItem->Item->Message = 'Bidding has ended for this item';
		$sUpdatedItem = json_encode($objItem);
		return $sUpdatedItem;
	}
	$nBids = count($objItem->Item->BidHistory);
	$sCurrentBid = ($nBids) ? $objItem->Item->BidHistory[$nBids-1]->Bid : $objItem->Item->StartingPrice - $objItem->Item->BidSteps;
	$sMinNextBid = $sCurrentBid + $objItem->Item->BidSteps;

	if ($objBid->sMaxAmount < $objItem->Item->StartingPrice) {
		$objItem->Item->Message = 'Bid below starting price';
		$sUpdatedItem = json_encode($objItem);
		return $sUpdatedItem;
	}
	else {
		if (!$nBids) { // There is no current bid (ergo no max bid either)
			if ($objBid->sMaxAmount < $objItem->Item->Reserve) { // New max bid is below reserve
				$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sMaxAmount;
				$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
				$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
				$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 1";
			}
			else { // New max bid is equal to or above reserve
				$objItem->Item->BidHistory[$nBids]->Bid = $objItem->Item->Reserve;
				$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
				$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
				$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 2";
				$objItem->Item->MaxBid->MaxBid = $objBid->sMaxAmount;
				$objItem->Item->MaxBid->User = $objBid->sUUID;
			}
		}
		else if ($objBid->sMaxAmount < $objItem->Item->BidHistory[$nBids-1]->Bid + $objItem->Item->BidSteps) { // New max bid is below current bid plus increment
			$objItem->Item->Message = "Bid below current winning bid ($" . $objItem->Item->BidHistory[$nBids-1]->Bid .") plus minimum increment ($" . $objItem->Item->BidSteps . ")";
			$sUpdatedItem = json_encode($objItem);
			return $sUpdatedItem;
		}
		else { // New max bid is equal to or above current bid plus increment
			if ($objBid->sMaxAmount < $objItem->Item->Reserve) { // New max bid is below reserve
				if (!$objItem->Item->MaxBid->MaxBid) { // There is no previous max bid
					$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sMaxAmount;
					$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
					$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
					$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 3";
				}
				else if ($objItem->Item->MaxBid->MaxBid > $objBid->sMaxAmount) { // New max bid is equal or below previous max bid
					$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sMaxAmount;
					$objItem->Item->BidHistory[$nBids]->User = $objItem->Item->MaxBid->User;
					$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
					$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 4";
				}
				else { // New max bid is above previous max bid
					$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sMaxAmount;
					$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
					$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
					$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 5";
					$objItem->Item->MaxBid->MaxBid = $objBid->sMaxAmount;
					$objItem->Item->MaxBid->User = $objBid->sUUID;
				}
			}
			else { // New max bid is equal to or above reserve
				if (!$objItem->Item->MaxBid->MaxBid) { // There is no previous max bid
					if ($objItem->Item->BidHistory[$nBids-1]->Bid > $objItem->Item->Reserve)
						$objItem->Item->BidHistory[$nBids]->Bid = $objItem->Item->BidHistory[$nBids-1]->Bid + $objItem->Item->BidSteps;
					else
						$objItem->Item->BidHistory[$nBids]->Bid = $objItem->Item->Reserve;
					$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
					$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
					$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 6";
					$objItem->Item->MaxBid->MaxBid = $objBid->sMaxAmount;
					$objItem->Item->MaxBid->User = $objBid->sUUID;
				}
				else if ($objBid->sMaxAmount <= $objItem->Item->MaxBid->MaxBid) { // New max bid is equal or below previous max bid
					if ($objItem->Item->MaxBid->User != $objBid->sUUID) { // Person submitting max bid doesn't have the current max bid
						$objItem->Item->BidHistory[$nBids]->Bid = $objBid->sMaxAmount;
						$objItem->Item->BidHistory[$nBids]->User = $objItem->Item->MaxBid->User;
						$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
						$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 7";
					}
					else {
						$objItem->Item->Message = "$" . $objBid->sMaxAmount . " is below your previous max bid of $" . $objItem->Item->MaxBid->MaxBid;
						$sUpdatedItem = json_encode($objItem);
						return $sUpdatedItem;
					}
				}
				else { // New max bid is above previous max bid
					if ($objItem->Item->BidHistory[$nBids-1]->User != $objBid->sUUID) { // Person upping max bid doesn't have the current winning bid
						if ($objItem->Item->BidHistory[$nBids-1]->Bid > $objItem->Item->MaxBid->MaxBid) // Old max bid larger than current bid
							$objItem->Item->BidHistory[$nBids]->Bid = $objItem->Item->BidHistory[$nBids-1]->Bid + $objItem->Item->BidSteps;
						else
							$objItem->Item->BidHistory[$nBids]->Bid = $objItem->Item->MaxBid->MaxBid + $objItem->Item->BidSteps;
						$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
						$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
						$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 8a";
						$objItem->Item->MaxBid->MaxBid = $objBid->sMaxAmount;
						$objItem->Item->MaxBid->User = $objBid->sUUID;
					}
					else { // Person upping max bid already has the current winning bid
						if ($objBid->sMaxAmount <= $objItem->Item->Reserve) { // the bid is smaller than or equal to the reserve
							$objItem->Item->BidHistory[$nBids]->Bid = $objItem->Item->Reserve;
							$objItem->Item->BidHistory[$nBids]->User = $objBid->sUUID;
							$objItem->Item->BidHistory[$nBids]->Time = $RightNow;
							$objItem->Item->BidHistory[$nBids]->Type = "Max Bid 8b";
							$objItem->Item->MaxBid->MaxBid = $objBid->sMaxAmount;
							$objItem->Item->MaxBid->User = $objBid->sUUID;
						}
						else { // the new max bid is larger than the reserve
							$objItem->Item->MaxBid->MaxBid = $objBid->sMaxAmount;
							$objItem->Item->MaxBid->User = $objBid->sUUID;
						}
					}
				}
			}
		}
	}
	$sUpdatedItem = json_encode($objItem, JSON_PRETTY_PRINT);
	file_put_contents($sFileLocation, $sUpdatedItem, LOCK_EX);
	return $sUpdatedItem;
}

function AddItemToWatch($AddItemToWatch) {
	$objItem = json_decode($AddItemToWatch);
	$sFileLocation = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objItem->sAuctionID . "/Auction.json";
	$sAuction = file_get_contents($sFileLocation);
	$objAuction = json_decode($sAuction);
	$nUserCount = count($objAuction->Users);
	for ($i=0; $i<$nUserCount; $i++) {
		if ($objAuction->Users[$i]->UUID === $objItem->sUUID) {
			$nWatchListCount = count($objAuction->Users[$i]->WatchList);
			for ($j=0; $j<$nWatchListCount; $j++) {
				if ($objAuction->Users[$i]->WatchList[$j] === $objItem->sItem)
					return $sAuction; // if the item is already on the users watch list, send the un-updated file back
			}
			$objAuction->Users[$i]->WatchList[] = $objItem->sItem;
			sort ($objAuction->Users[$i]->WatchList);
			$sAuctionUpdated = json_encode($objAuction, JSON_PRETTY_PRINT);
			file_put_contents($sFileLocation, $sAuctionUpdated, LOCK_EX);
			return $sAuctionUpdated;
		}
	}
}

function RemoveItemFromWatch($RemoveItemFromWatch) {
	$objItem = json_decode($RemoveItemFromWatch);
	$sFileLocation = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objItem->sAuctionID . "/Auction.json";
	$sAuction = file_get_contents($sFileLocation);
	$objAuction = json_decode($sAuction);
	$nUserCount = count($objAuction->Users);
	for ($i=0; $i<$nUserCount; $i++) {
		if ($objAuction->Users[$i]->UUID === $objItem->sUUID) {
			$nWatchListCount = count($objAuction->Users[$i]->WatchList);
			for ($j=0; $j<$nWatchListCount; $j++) {
				if ($objAuction->Users[$i]->WatchList[$j] === $objItem->sItem) {
					unset($objAuction->Users[$i]->WatchList[$j]);
					$objAuction->Users[$i]->WatchList = array_values($objAuction->Users[$i]->WatchList);
					$sAuctionUpdated = json_encode($objAuction, JSON_PRETTY_PRINT);
					file_put_contents($sFileLocation, $sAuctionUpdated, LOCK_EX);
					return $sAuctionUpdated;
				}
			}
		}
	}
}

function GetItemsList($sAuctionID) {
	$ItemsDir = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $sAuctionID . "/Items/";
	$aItems = scandir($ItemsDir);
	$sItems = json_encode($aItems);
	return $sItems;
}

function UpdateUser($UpdateUser) {
	$objUpdateUser = json_decode($UpdateUser);
	$sFileLocation = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objUpdateUser->sAuctionID . "/Auction.json";
	$sAuction = file_get_contents($sFileLocation);
	$objAuction = json_decode($sAuction);
	$nUserCount = count($objAuction->Users);
	for ($i=0; $i<$nUserCount; $i++) {
		if ($objAuction->Users[$i]->UUID === $objUpdateUser->sUUID) {
			$objAuction->Users[$i]->First = $objUpdateUser->First;
			$objAuction->Users[$i]->Last = $objUpdateUser->Last;
			$objAuction->Users[$i]->EMail = $objUpdateUser->EMail;
			$objAuction->Users[$i]->Cel = $objUpdateUser->Cel;
			$objAuction->Users[$i]->Username = $objUpdateUser->Username;
			$objAuction->Users[$i]->Password = $objUpdateUser->Password;
			$sAuctionUpdated = json_encode($objAuction, JSON_PRETTY_PRINT);
			file_put_contents($sFileLocation, $sAuctionUpdated, LOCK_EX);
			return $sAuctionUpdated;
		}
	}
}

function AddNewUser($SubmitNewUser) {
	$objNewUser = json_decode($SubmitNewUser);
	$sFileLocation = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objNewUser->sAuctionID . "/Auction.json";
	$sAuction = file_get_contents($sFileLocation);
	$objAuction = json_decode($sAuction);
	$nUserCount = count($objAuction->Users);
	$objAuction->Users[$nUserCount]->First = $objNewUser->First;
	$objAuction->Users[$nUserCount]->Last = $objNewUser->Last;
	$objAuction->Users[$nUserCount]->UUID = 'U' . MakeRandomCode(3) . str_pad($nUserCount, 5, '0', STR_PAD_LEFT);
	$objAuction->Users[$nUserCount]->EMail = $objNewUser->EMail;
	$objAuction->Users[$nUserCount]->Cel = $objNewUser->Cel;
	$objAuction->Users[$nUserCount]->Username = $objNewUser->Username;
	$objAuction->Users[$nUserCount]->Password = $objNewUser->Password;
	$objAuction->Users[$nUserCount]->Admin = $objNewUser->Admin;
	$objAuction->Users[$nUserCount]->WatchList = $objNewUser->WatchList;
	$sAuctionUpdated = json_encode($objAuction, JSON_PRETTY_PRINT);
	file_put_contents($sFileLocation, $sAuctionUpdated, LOCK_EX);
	return $sAuctionUpdated;
}

function MakeRandomCode($nDigits) {
	$sCode = '';
	for ($i=0; $i<$nDigits; $i++) {
		$sCode .= GetRandomCharacter();
	}
	return $sCode;
}

function GetRandomCharacter() {
  $aChar = array("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
  return $aChar[rand(0, count($aChar)-1)];
}

function AuctionUpdate($AuctionUpdate) {
	$objAuctionUpdate = json_decode($AuctionUpdate);
	$sFileLocation = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objAuctionUpdate->sAuctionID . "/Auction.json";
	$sAuction = file_get_contents($sFileLocation);
	$objAuction = json_decode($sAuction);
	$objAuction->Name = $objAuctionUpdate->Name;
	$objAuction->Starts = $objAuctionUpdate->Starts;
	$objAuction->Ends = $objAuctionUpdate->Ends;
	$sAuctionUpdated = json_encode($objAuction, JSON_PRETTY_PRINT);
	file_put_contents($sFileLocation, $sAuctionUpdated, LOCK_EX);
	return $sAuctionUpdated;
}

function SaveItem($ItemToSave) {
	$objItem = json_decode($ItemToSave);
	$ItemsDir = "/home8/mulholl3/public_html/messystudio/Chrome/Auction/Data/". $objItem->Item->sAuctionID . "/Items/";
	$aItems = scandir($ItemsDir);
	$nFileCount = count($aItems) -2;
	$objItem->Item->UUID = 'I' . str_pad($nFileCount, 5, '0', STR_PAD_LEFT);
	$sNewFileName = $ItemsDir . $objItem->Item->UUID . '.json';
	$sItem = json_encode($objItem, JSON_PRETTY_PRINT);
	file_put_contents($sNewFileName, $sItem, LOCK_EX);
	return $sItem;
}


?>