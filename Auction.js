
var QueryString = function() {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
    return query_string;
} ();

function GlobalX() {
	return 0;
}

$(document).ready(function() {
	var sAuctionID = getCookie("AuctionID");
	var sUUID = getCookie("UUID");
	if (QueryString.AuctionID && QueryString.UUID)
		LoadDataUsingAuctionIDAndUUID(QueryString.AuctionID, QueryString.UUID);
	else if (sAuctionID && sUUID)
		LoadDataUsingAuctionIDAndUUID(sAuctionID, sUUID);
	else
		MakeLogInPage();
});

function MakeLogo(bImage) { // http://www.easyicon.net/language.en/1076404-auction_hammer_icon.html
	var sLogo = "<div class='Logo' style='text-align: center;'>";
	if (bImage)
		sLogo += "<img src='Images/Auction128.png' style='max-width: 128px;'><br>";
	sLogo += "<span class='LogoType'>auctionification</span>";
	sLogo += "</div>";
	return sLogo;
}

function MakeLogInPage() {
	var sPage = "<p class='Headline' style='text-align: center;' id='Welcome'>Welcome!</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='Auction ID' id='AuctionID' maxlength='8' OnInput='OnChangeAuctionID()' OnKeyUp='OnChangeAuctionID()' OnChange='OnChangeAuctionID()' OnPaste='OnChangeAuctionID()'></p>";
	sPage += "<div class='BidBox' id='LogInPanel'>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' disabled='true' placeholder='User Name or EMail' id='AuctionUserName'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='password' class='Controls' style='text-align: center;' disabled='true' placeholder='Password' id='AuctionPassword'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='checkbox' class='Controls' id='RememberMe' checked>Remember me on this device</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='button' class='Controls' style='text-align: center;' id='AuctionLogIn' disabled='true' OnClick='OnClickLogIn()' value='Log In'></p>";
	sPage += "<p style='text-align: center; font-size: 80%;'>";
	sPage += "<a href='javascript:MakeNewAccountPage()'>Create a new user account for this auction?</a></p>";
	sPage += "</div>"; // End of LogInPanel
	sPage += "<div style='font-size: 80%;' id='CreateNewAuction'><p style='text-align: center;'>";
	sPage += "<a href='javascript:alertify.alert(\"Function not yet implemented\")'>Create a new auction?</a>";
	sPage += "</p></div>";  // End of CreateNewAuction
	sPage += "<p id='Feedback' class='LogInHelpClass'><a href='javascript:LogInHelp()'>Help?</a></p>";
	sPage += MakeLogo(false) + "</br>";
	document.getElementById('PageContent').innerHTML = sPage;
	document.getElementById('AuctionID').focus();
}

function OnChangeAuctionID() {
	var sAuctionID = document.getElementById('AuctionID').value.trim().toUpperCase();
	document.getElementById('Welcome').innerHTML = 'Welcome!';
	document.getElementById('AuctionUserName').disabled = true;
	document.getElementById('AuctionPassword').disabled = true;
	document.getElementById('AuctionLogIn').disabled = true;
	document.getElementById('Feedback').innerHTML = "<a href='javascript:LogInHelp()'>Help?</a>";
	document.getElementById('LogInPanel').style.display = 'none';
	document.getElementById('CreateNewAuction').style.display = 'block';
	if (8 === sAuctionID.length) {
		GlobalX.data = null;
		document.getElementById('Feedback').innerHTML = "<a href='javascript:LogInHelp()'>Is the auction ID correct?</a>";
		document.getElementById('AuctionUserName').disabled = false;
		$.post("Data/" + sAuctionID + "/Auction.json", {
			Auction: '',
			},
			function(data, status){
			if (data) {
				GlobalX.data = data;
				GlobalX.AuctionID = sAuctionID;
				document.getElementById('LogInPanel').style.display = 'block';
				document.getElementById('CreateNewAuction').style.display = 'none';
				document.getElementById('AuctionUserName').focus();
				document.getElementById('Welcome').innerHTML = data.Name;
				document.getElementById('Feedback').innerHTML = "<a href='javascript:LogInHelp()'>Help?</a>";
				document.getElementById('AuctionPassword').disabled = false;
				document.getElementById('AuctionLogIn').disabled = false;
			}
		}, "json");
	}
}

function LoadDataUsingAuctionIDAndUUID(sAuctionID, sUUID) {
	GlobalX.data = null;
	MakeLogInPage();
	$.post("Data/" + sAuctionID + "/Auction.json", {
		Auction: '',
		},
		function(data, status){
		if (data) {
			GlobalX.data = data;
			GlobalX.AuctionID = sAuctionID;
			if (UUIDLogIn(sUUID))
				MakeMenuPage();
			else
				MakeLogInPage();
		}
	}, "json");
}

function OnClickLogIn() {
	var bCredentials = false;
	var sUserName = document.getElementById('AuctionUserName').value.trim();
	var sPassword = document.getElementById('AuctionPassword').value.trim();
	if (sUserName.length > 7 && sPassword.length > 7) {
		for (var i=0; i<GlobalX.data.Users.length; i++) {
			if (sUserName.toUpperCase() === GlobalX.data.Users[i].Username.toUpperCase() || sUserName.toUpperCase() === GlobalX.data.Users[i].EMail.toUpperCase()) {
				if (sPassword === GlobalX.data.Users[i].Password) {
					bCredentials = true;
					GlobalX.UUID = GlobalX.data.Users[i].UUID;
					GlobalX.First = GlobalX.data.Users[i].First;
					GlobalX.Admin = GlobalX.data.Users[i].Admin;
					GlobalX.WatchList = GlobalX.data.Users[i].WatchList;
					GlobalX.nWatchListCount = '' + GlobalX.WatchList.length;
					GlobalX.aWatchList = [];
					for (var j=0; j<GlobalX.nWatchListCount; j++) {
						GlobalX.aWatchList[j] = {};
						GlobalX.aWatchList[j].Item = {};
						GlobalX.aWatchList[j].Item.UUID = GlobalX.WatchList[j];
					}
					LoadWatchListData();
					GetItemList();
					i = GlobalX.data.Users.length + 1;  // Stop the looping
					if (document.getElementById('RememberMe').checked) {
						setCookie("AuctionID", GlobalX.AuctionID, 1);
						setCookie("UUID", GlobalX.UUID, 1);
					}
					MakeMenuPage();
				}
			}
		}
	}
	if (!bCredentials)
		alertify.alert("Incorrect password or user name");
}

function UUIDLogIn(sUUID) {
	var bCredentials = false;
	if (!GlobalX.data)
		return false;
	for (var i=0; i<GlobalX.data.Users.length; i++) {
		if (sUUID === GlobalX.data.Users[i].UUID) {
			bCredentials = true;
			GlobalX.UUID = GlobalX.data.Users[i].UUID;
			GlobalX.First = GlobalX.data.Users[i].First;
			GlobalX.Admin = GlobalX.data.Users[i].Admin;
			GlobalX.WatchList = GlobalX.data.Users[i].WatchList;
			GlobalX.nWatchListCount = '' + GlobalX.WatchList.length;
			GlobalX.aWatchList = [];
			for (var j=0; j<GlobalX.nWatchListCount; j++) {
				GlobalX.aWatchList[j] = {};
				GlobalX.aWatchList[j].Item = {};
				GlobalX.aWatchList[j].Item.UUID = GlobalX.WatchList[j];
			}
			LoadWatchListData();
			GetItemList();
			i = GlobalX.data.Users.length + 1;  // Stop the looping
			return true;
		}
	}
	if (!bCredentials)
		return false;
}

function LoadWatchListData() {
	LoadWatchListData.nCounter = 0;
	for (var j=0; j<GlobalX.WatchList.length; j++) {
		$.post("Data/" + GlobalX.AuctionID + "/Items/" + GlobalX.WatchList[j] + ".json", {
			Auction: '',
			},
			WatchListRawDataAsArray, "json");
	}
}

function WatchListRawDataAsArray(data, status) {
	if (data) {
		for (var i=0; i<GlobalX.nWatchListCount; i++) {
			if (data.Item.UUID === GlobalX.aWatchList[i].Item.UUID)
				GlobalX.aWatchList[i] = data;
		}
	}
}

function Reanimate(ID, sClass) {
	var element = document.getElementById(ID);
	element.classList.remove(sClass);
	element.offsetWidth = element.offsetWidth;
	element.classList.add(sClass);
}

function LogInHelp() {
	alertify.alert("Help?");
}

function MakeNewAccountPage() {
	var sPage = "<p class='Headline' style='text-align: center;' id='Welcome'>New User</p>";
	sPage += "<p class='LogInHelpClass'>" + GlobalX.data.Name + "</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='First Name' id='NAFirst' maxlength='25' OnInput='ChangeNewUser()' OnKeyUp='ChangeNewUser()' OnChange='ChangeNewUser()' OnPaste='ChangeNewUser()'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='Last Name' id='NALast' maxlength='35' OnInput='ChangeNewUser()' OnKeyUp='ChangeNewUser()' OnChange='ChangeNewUser()' OnPaste='ChangeNewUser()'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='email' class='Controls' style='text-align: center;' placeholder='EMail Address' id='NAEMail' maxlength='45' OnInput='ChangeNewUser()' OnKeyUp='ChangeNewUser()' OnChange='ChangeNewUser()' OnPaste='ChangeNewUser()'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='tel' class='Controls' style='text-align: center;' placeholder='Cel Number' id='NAMobile' maxlength='15' OnInput='ChangeNewUser()' OnKeyUp='ChangeNewUser()' OnChange='ChangeNewUser()' OnPaste='ChangeNewUser()'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='User Name' id='NAUserName' maxlength='25' OnInput='ChangeNewUser()' OnKeyUp='ChangeNewUser()' OnChange='ChangeNewUser()' OnPaste='ChangeNewUser()'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='password' class='Controls' style='text-align: center;' placeholder='Password' id='NAPassword1' maxlength='65' OnInput='ChangeNewUser()' OnKeyUp='ChangeNewUser()' OnChange='ChangeNewUser()' OnPaste='ChangeNewUser()'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='password' class='Controls' style='text-align: center;' placeholder='Confirm Password' id='NAPassword2' maxlength='65' OnInput='ChangeNewUser()' OnKeyUp='ChangeNewUser()' OnChange='ChangeNewUser()' OnPaste='ChangeNewUser()'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='button' class='Controls' style='text-align: center;' id='CreateNewAccountSubmit' disabled='true' OnClick='OnClickCreateNewAccount()' value='Submit'>";
	sPage += "<input type='button' class='Controls' id='Cancel' value='Cancel' OnClick='MakeLogInPage()'></p>";
	sPage += "<p id='Feedback' class='LogInHelpClass'>Enter your first name</p>";
	sPage += MakeLogo(true) + "</br>";
	document.getElementById('PageContent').innerHTML = sPage;
	document.getElementById('NAFirst').focus();
}

function ChangeNewUser() {
	document.getElementById('CreateNewAccountSubmit').disabled = true;
	var sFirst = document.getElementById('NAFirst').value.trim();
	var sLast = document.getElementById('NALast').value.trim();
	var sEMail = document.getElementById('NAEMail').value.trim();
	var sCel = document.getElementById('NAMobile').value.trim();
	var sUsername = document.getElementById('NAUserName').value.trim();
	var sNew1 = document.getElementById('NAPassword1').value.trim();
	var sNew2 = document.getElementById('NAPassword2').value.trim();
	var sFeedback = '';
	if (sFirst.length < 2)
		sFeedback = 'Enter your first name';
	else if (sLast.length < 2)
		sFeedback = 'Enter your last name';
	else if (!IsEMailAddressValid(sEMail))
		sFeedback = 'Enter your email address';
	else if (!IsEMailAddressUnique(sEMail, -1))
		sFeedback = 'That email address is already in use';
	else if (sCel.length < 10)
			sFeedback = 'Enter your cel number';
	else if (!IsCelNumberValid(sCel))
			sFeedback = 'Enter your cel number';
	else if (sUsername.length < 6)
			sFeedback = 'User Name must be at least 6 characters';
	else if (!IsUserNameUnique(sUsername, -1))
		sFeedback = 'User Name is already in use';
	else if (sNew1.length < 8)
		sFeedback = 'New password must be at least eight characters';
	else if (sNew1 !== sNew2)
		sFeedback = 'New password and confirmation do not match';
	else {
		document.getElementById('CreateNewAccountSubmit').disabled = false;
		sFeedback = '';
		document.getElementById('NAMobile').value = FormatCelNumber(sCel);
	}
	document.getElementById('Feedback').innerHTML = sFeedback;
}

function OnClickCreateNewAccount() {
	document.getElementById('CreateNewAccountSubmit').disabled = true;
	var objNewUser = {};
	objNewUser.sAuctionID = GlobalX.AuctionID;
	objNewUser.First = document.getElementById('NAFirst').value.trim();
	objNewUser.Last = document.getElementById('NALast').value.trim();
	objNewUser.EMail = document.getElementById('NAEMail').value.trim();
	objNewUser.Cel = document.getElementById('NAMobile').value.trim();
	objNewUser.Username = document.getElementById('NAUserName').value.trim();
	objNewUser.Password = document.getElementById('NAPassword1').value.trim();
	objNewUser.Admin = false;
	objNewUser.WatchList = [];
	var sNewUser = JSON.stringify(objNewUser);
	$.post("Auction.php", {
		SubmitNewUser: sNewUser,
		},
		function(data, status){
			if (data) {
				LoadDataUsingAuctionIDAndUUID(GlobalX.AuctionID, data.Users[data.Users.length-1].UUID);
			}
	}, "json");
}

function MakeMenuPage() {
	KillItemTimers();
	var sPage = "<p class='Headline' style='text-align: center;' id='Welcome'>Welcome, " + GlobalX.First + "!</p>";
	sPage += "<p class='MenuItem'>";
	sPage += "<a href='javascript:MakeItemLookUpPage()'>Look Up Item</a></p>";
	sPage += "<p class='MenuItem'>";
	sPage += "<a href='javascript:MakeWatchListPage()'>Watch List</a></p>";
	sPage += "<p class='MenuItem'>";
	sPage += "<a href='javascript:MakeEditInfoPage()'>Edit Your Info</a></p>";
	if (GlobalX.Admin) {
		sPage += "<p class='MenuItem''>";
		sPage += "<a href='javascript:MakeAdminToolsPage()'>Admin Tools</a></p>";
	}
	sPage += "<p class='MenuItem''>";
	sPage += "<a href='javascript:MakeAboutPage()'>About</a></p>";
	if (getCookie('UUID')) {
		sPage += "<p class='MenuItem''>";
		sPage += "<a href='javascript:OnClickLogOut()'>Log Out</a></p>";
	}
	sPage += "<br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
}

function MakeMenuLink() {
	return "<p class='MenuClass'><a href='javascript:MakeMenuPage()' id='MenuLink'>Menu</a></p>";
}

function KillItemTimers() {
	if (MakeItemDetailPage.RefreshTimer) {
		window.clearInterval(MakeItemDetailPage.RefreshTimer);
		MakeItemDetailPage.RefreshTimer = 0;
	}
	if (GlobalX.aWatchList.RefreshTimer) {
		window.clearInterval(GlobalX.aWatchList.RefreshTimer);
		GlobalX.aWatchList.RefreshTimer = 0;
	}
}

function OnClickLogOut() {
	setCookie("AuctionID", '', 1);
	setCookie("UUID", '', 1);
	MakeLogInPage();
}

function MakeWatchListPage() {
	var sPage = MakeMenuLink();
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>" + GlobalX.First + "'s Watch List</p>";
	var sItem = [];
	for (var i=0; i<GlobalX.aWatchList.length; i++) {
		sItem[i] = "<div class='WatchListClass' id='"+GlobalX.aWatchList[i].Item.UUID+"'>";
		sItem[i] += "<a href='javascript:MakeItemDetailPage(\""+GlobalX.aWatchList[i].Item.UUID+"\")'><b>"+GlobalX.aWatchList[i].Item.Name + "</b></a>: " + GlobalX.aWatchList[i].Item.ShortDescription + " (value: $" + GlobalX.aWatchList[i].Item.Value + ")<br>";
		sItem[i] += "<a id='" + GlobalX.aWatchList[i].Item.UUID + "r' href='javascript:RefreshItem(\""+GlobalX.aWatchList[i].Item.UUID+"\")' style='float: right;'><img src='Images/RefreshI16.png'></a>";
		sItem[i] += "<div id='"+GlobalX.aWatchList[i].Item.UUID+"u'>"; // Updateable part of the item start
		var nNextLowBid = (GlobalX.aWatchList[i].Item.BidHistory.length) ? Number(GlobalX.aWatchList[i].Item.BidHistory[GlobalX.aWatchList[i].Item.BidHistory.length-1].Bid) + Number(GlobalX.aWatchList[i].Item.BidSteps) : Number(GlobalX.aWatchList[i].Item.StartingPrice);
		sItem[i] += MakeItemUpdateables(i);
		sItem[i] += "</div>";  // Updateable part of the item end
		sItem[i] += "<div class='BidBox' style='display: none;' id='"+GlobalX.aWatchList[i].Item.UUID+"b'>$<input id='"+GlobalX.aWatchList[i].Item.UUID+"tb' type='Number' value='"+nNextLowBid+"' style='text-align: center; width: 150px; font-size: 150%;'> <input type='button' style='font-size: 150%;' value='Bid' id='"+GlobalX.aWatchList[i].Item.UUID+"btn' OnClick=SubmitCustomBid(\""+GlobalX.aWatchList[i].Item.UUID+"\")></div>";
		sItem[i] += "</div><br>";
	}
	if (!GlobalX.aWatchList.length)
		sPage += "<p style='text-align: center;'><a href='javascript:MakeItemLookUpPage()'>Add an item to your watch list?</a></p>";
	var sList = '';
	for (var j=0; j<GlobalX.aWatchList.length; j++) {
		if (GlobalX.aWatchList[j].Item.Show) {
			sList += sItem[j];
		}
	}
	sPage += sList;
	sPage += "<br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
	if (!GlobalX.aWatchList.RefreshTimer)
		GlobalX.aWatchList.RefreshTimer = setInterval(function(){RefreshAllWatchlistItems();}, 60000);
}

function RefreshAllWatchlistItems() {
	for (var j=0; j<GlobalX.aWatchList.length; j++) {
		if (GlobalX.aWatchList[j].Item.Show)
			RefreshItem(GlobalX.aWatchList[j].Item.UUID);
	}
}

function MakeItemUpdateables(nIndex) {
	var sItem = '';
	if (GlobalX.aWatchList[nIndex].Item.Show) {
		var bYou = false;
		if (!GlobalX.aWatchList[nIndex].Item.BidHistory.length) {
				sItem += "<span style='color: green;'>Starting bid: $" + Number(GlobalX.aWatchList[nIndex].Item.StartingPrice).toFixed(2) + "</span><br>";
				sItem += "<a id='" + GlobalX.aWatchList[nIndex].Item.UUID + "fb' href='javascript:SubmitBid(\""+GlobalX.aWatchList[nIndex].Item.UUID+"\", \""+GlobalX.aWatchList[nIndex].Item.StartingPrice+"\")'>Bid $" + Number(GlobalX.aWatchList[nIndex].Item.StartingPrice).toFixed(2) + " - </a>";
		}
		else {
			var nNextLowBid = Number(GlobalX.aWatchList[nIndex].Item.BidHistory[GlobalX.aWatchList[nIndex].Item.BidHistory.length-1].Bid) + Number(GlobalX.aWatchList[nIndex].Item.BidSteps);
			if (GlobalX.aWatchList[nIndex].Item.BidHistory[GlobalX.aWatchList[nIndex].Item.BidHistory.length-1].User === GlobalX.UUID)
				bYou = true;
			if (bYou)
				sItem += "Current bid: $" + Number(GlobalX.aWatchList[nIndex].Item.BidHistory[GlobalX.aWatchList[nIndex].Item.BidHistory.length-1].Bid).toFixed(2) + " (you)";
			else
				sItem += "<span style='color: red;'>Current bid: $" + Number(GlobalX.aWatchList[nIndex].Item.BidHistory[GlobalX.aWatchList[nIndex].Item.BidHistory.length-1].Bid).toFixed(2) + "</span>";
			if (Number(GlobalX.aWatchList[nIndex].Item.Reserve) > Number(GlobalX.aWatchList[nIndex].Item.BidHistory[GlobalX.aWatchList[nIndex].Item.BidHistory.length-1].Bid))
				sItem += " - <span style='color: red;'>reserve not met</span>";
			sItem += "<br>";
			sItem += "<a id='" + GlobalX.aWatchList[nIndex].Item.UUID + "fb' href='javascript:SubmitBid(\""+GlobalX.aWatchList[nIndex].Item.UUID+"\", \""+nNextLowBid+"\")'>Bid $" + Number(nNextLowBid).toFixed(2) + " - </a>";
		}
		sItem += "<a href='javascript:ShowCustBidBox(\""+GlobalX.aWatchList[nIndex].Item.UUID+"\", false)'>Custom Bid - </a>";
		sItem += "<a href='javascript:ShowCustBidBox(\""+GlobalX.aWatchList[nIndex].Item.UUID+"\", true)'>Set Max Bid</a>";
		sItem += "<a href='javascript:RemoveItemFromWatchList(\""+GlobalX.aWatchList[nIndex].Item.UUID+"\")' id='"+GlobalX.aWatchList[nIndex].Item.UUID+"tc' title='Remove item from watch list?'> - <img src='Images/TrashCan16.png'></a>";
	}
	else
		sItem += "<span style='font-size: 80%'><i>Item data not available for viewing at this time</i></span><br><br>";
	return sItem;
}

function ShowCustBidBox(nID, bMaxBid) {
	if (document.getElementById(nID+'b').style.display === 'none') {
		document.getElementById(nID+'b').style.display = 'block';
		document.getElementById(nID+'btn').value = (bMaxBid) ? "Max Bid" : "Bid";
		document.getElementById(nID+'tb').focus();
	}
	else {
		document.getElementById(nID+'b').style.display = 'none';
	}
}

function SubmitCustomBid(nID) {  //Custom or Max Bid
	var sBid = document.getElementById(nID+'tb').value.trim();
	if (isNumeric(sBid)) {
		if ('Max Bid' === document.getElementById(nID+'btn').value) {
			SubmitMaxBid(nID, sBid);
			document.getElementById(nID+'b').style.display = 'none';
		}
		else {
			SubmitBid(nID, sBid);
			document.getElementById(nID+'b').style.display = 'none';
		}
	}
	else
		alertify.alert("Not a valid number");
}

function SubmitBid(sItem, sAmount) {
	document.getElementById(sItem+'fb').style.display = 'none';
	var objBid = {};
	objBid.sItem = sItem;
	objBid.sAmount = sAmount;
	objBid.sUUID = GlobalX.UUID;
	objBid.sAuctionID = GlobalX.AuctionID;
	var sBid = JSON.stringify(objBid);
	$.post("Auction.php", {
		SubmitBid: sBid,
		},
		function(data, status){
			for (var i=0; i<GlobalX.aWatchList.length; i++) {
				if (data.Item.UUID === GlobalX.aWatchList[i].Item.UUID) {
					GlobalX.aWatchList[i] = data;
				}
			}
			document.getElementById(data.Item.UUID+'u').innerHTML = MakeItemDetailUpdate(data);
			if (document.getElementById('AdminBidHist'))
				document.getElementById('AdminBidHist').innerHTML = MakeAdminBidHist(data);
			if (data.Item.Message)
				alertify.alert(data.Item.Message);
	}, "json");
}

function SubmitMaxBid(sItem, sMaxAmount) {
	var objBid = {};
	objBid.sItem = sItem;
	objBid.sMaxAmount = sMaxAmount;
	objBid.sUUID = GlobalX.UUID;
	objBid.sAuctionID = GlobalX.AuctionID;
	var sMaxBid = JSON.stringify(objBid);
	$.post("Auction.php", {
		SubmitMaxBid: sMaxBid,
		},
		function(data, status){
			for (var i=0; i<GlobalX.aWatchList.length; i++) {
				if (data.Item.UUID === GlobalX.aWatchList[i].Item.UUID) {
					GlobalX.aWatchList[i] = data;
				}
			}
			document.getElementById(data.Item.UUID+'u').innerHTML = MakeItemDetailUpdate(data);
			if (document.getElementById('AdminBidHist'))
				document.getElementById('AdminBidHist').innerHTML = MakeAdminBidHist(data);
			if (data.Item.Message)
				alertify.alert(data.Item.Message);
	}, "json");
}

function RemoveItemFromWatchList(sItem) {
	alertify.confirm("Are you sure you want to remove this item from your watch list?", function (e) {
    if (e) { //after clicking OK
			document.getElementById(sItem+'tc').style.display = 'none';
			var objRemoveItem = {};
			objRemoveItem.sItem = sItem;
			objRemoveItem.sUUID = GlobalX.UUID;
			objRemoveItem.sAuctionID = GlobalX.AuctionID;
			var sRemoveItem = JSON.stringify(objRemoveItem);
			$.post("Auction.php", {
				RemoveItemFromWatch: sRemoveItem,
				},
				function(data, status) {
				if (data)
					GlobalX.data = data;
					for (var i=0; i<GlobalX.data.Users.length; i++) {
						if (GlobalX.UUID === GlobalX.data.Users[i].UUID) {
							GlobalX.First = GlobalX.data.Users[i].First;
							GlobalX.Admin = GlobalX.data.Users[i].Admin;
							GlobalX.WatchList = GlobalX.data.Users[i].WatchList;
							GlobalX.nWatchListCount = '' + GlobalX.WatchList.length;
							GlobalX.aWatchList = [];
							for (var j=0; j<GlobalX.nWatchListCount; j++) {
								GlobalX.aWatchList[j] = {};
								GlobalX.aWatchList[j].Item = {};
								GlobalX.aWatchList[j].Item.UUID = GlobalX.WatchList[j];
							}
							LoadWatchListData();
							i = GlobalX.data.Users.length + 1;  // Stop the looping
						}
					}
					MakeMenuPage();
				}, "json");
    } else {  //after clicking Cancel
    }
	});
}

function GetItemList() {
	$.post("Auction.php", {
		GetItemsList: GlobalX.AuctionID,
		},
		function(data, status){
		GlobalX.aItems = data;
	}, "json");
}

function MakeItemLookUpPage() {
	KillItemTimers();
	var sPage = MakeMenuLink();
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Look Up Item</p>";
	sPage += "<div class='WatchListClass'>";
	for (var i=0; i<GlobalX.aItems.length; i++) {
		if (GlobalX.aItems[i] != '.' && GlobalX.aItems[i] != '..') {
			sPage += "<a href='javascript:MakeItemDetailPage(\""+GlobalX.aItems[i].substring(0, 6)+"\")'>" + GlobalX.aItems[i].substring(0, 6) + "</a>";
			if (i < GlobalX.aItems.length-1) sPage += " - ";
		}
	}
	sPage += "</div>";
	sPage += "<br><br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
}

function MakeItemDetailPage(sItem) {
	KillItemTimers();
	var sPage = MakeMenuLink();
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Item Detail</p>";
	$.post("Data/" + GlobalX.AuctionID + "/Items/" + sItem + ".json", {
		Nada: '',
		},
		function(data, status) {
			for (var j=0; j<GlobalX.aWatchList.length; j++) {
				if (data.Item.UUID === GlobalX.aWatchList[j].Item.UUID) {
					GlobalX.aWatchList[j] = data;
				}
			}
			sPage += "<div class='WatchListClass' id='"+sItem+"'>";
			if (data.Item.Show) {
				sPage += "<a href='javascript:MakeItemDetailPage(\""+sItem+"\")'><b>" + data.Item.Name + "</b></a> (" + data.Item.UUID + ")<br>" + data.Item.Description + "<br><br>Value: $" + Number(data.Item.Value).toFixed(2) + ". ";
				sPage += "Min Bid Increments: $" + Number(data.Item.BidSteps).toFixed(2) + ".<br>";
				var d = new Date();
				var dStart = new Date(data.Item.Starts);
				var sSColor = (d.valueOf() > dStart.valueOf()) ? "color: green;" : "color: black;";
				sPage += "<span style='"+sSColor+"'>Bidding start: "+dStart.toLocaleString()+"</span><br>";
				var dEnd = new Date(data.Item.Ends);
				var sEColor = (d.valueOf() > dEnd.valueOf()) ? "color: red;" : "color: black;";
				sPage += "<span style='"+sEColor+"'>Bidding end: "+dEnd.toLocaleString()+"</span><br>";
				sPage += "<a id='" + sItem + "r' href='javascript:RefreshItemDetail(\""+sItem+"\")' style='float: right;'><img src='Images/RefreshI16.png'></a>";
				sPage += "<div id='"+sItem+"u'>"; // Updateable part of the item start
				var nNextLowBid = (data.Item.BidHistory.length) ? Number(data.Item.BidHistory[data.Item.BidHistory.length-1].Bid) + Number(data.Item.BidSteps) : data.Item.StartingPrice;
				sPage += MakeItemDetailUpdate(data);
				sPage += "</div>";  // Updateable part of the item end
				sPage += "<div class='BidBox' style='display: none;' id='"+sItem+"b'>$<input id='"+sItem+"tb' type='Number' value='"+0+"' style='text-align: center; width: 150px; font-size: 150%;'> <input type='button' style='font-size: 150%;' value='Bid' id='"+sItem+"btn' OnClick=SubmitCustomBid(\""+sItem+"\")></div>";
				sPage += "<br>";
				var bItemFound = false;
				for (var i=0; i< GlobalX.WatchList.length; i++){
					if (GlobalX.WatchList[i] === sItem)
						bItemFound = true;
				}
				if (!bItemFound)
					sPage += "<a href='javascript:AddItemToWatchList(\"" + sItem + "\")' id='"+sItem+"awl'>Add to Watch List</a><br><br>";
				sPage += "<a href='javascript:MakeItemLookUpPage()'>Look Up Another Item</a><br><br>";
				if (GlobalX.Admin) {
					sPage += "<div id='AdminBidHist'>";
					sPage += MakeAdminBidHist(data);
					sPage += "</div>"; // end of Admin Bid Hist
				}
				if (!MakeItemDetailPage.RefreshTimer)
					MakeItemDetailPage.RefreshTimer = setInterval(function () {RefreshItemDetail(sItem);}, 45000);
			}
			else
				sPage += "<i>Item data not available for viewing at this time</i><br><br>";
			sPage += "</div>";
			sPage += MakeLogo(true);
			document.getElementById('PageContent').innerHTML = sPage;
	}, "json");
}

function MakeAdminBidHist(data) {
	var sPage = "<br><b>" + data.Item.Name + " - Bidding History</b><br>";
	sPage += "Starting bid:  $" + Number(data.Item.StartingPrice).toFixed(2) + " - ";
	if (data.Item.BidHistory.length) {
		if (Number(data.Item.Reserve) > Number(data.Item.BidHistory[data.Item.BidHistory.length-1].Bid)) {
			if (data.Item.Reserve)
				sPage += "<span style='color: red;'>Reserve:  $" + Number(data.Item.Reserve).toFixed(2) + "</span><br>";
		}
		else
			sPage += "<span style='color: DimGray;'>Reserve:  $" + Number(data.Item.Reserve).toFixed(2) + "</span><br>";
	}
	else if (data.Item.Reserve)
		sPage += "Reserve:  $" + Number(data.Item.Reserve).toFixed(2) + "<br>";
	if (data.Item.MaxBid.length)
		sPage += "Max Bid:  " + UUIDToLastFirst(data.Item.MaxBid.User) + " - $" + Number(data.Item.MaxBid.MaxBid).toFixed(2) +"<br>";
	sPage += "Number of Bids:  " + data.Item.BidHistory.length;
	if (data.Item.BidHistory.length) {
		sPage += " - High: $" + Number(data.Item.BidHistory[data.Item.BidHistory.length-1].Bid).toFixed(2);
		for (var k=Number(data.Item.BidHistory.length)-1; k>=0; k--) {
			var d = new Date(Number(data.Item.BidHistory[k].Time));
			sPage += "<div class='BidBox' style='display: block;'><span style='font-size: 70%'>" + d.toLocaleString() + "</span><br>";
			sPage += UUIDToLastFirst(data.Item.BidHistory[k].User) + " - $" + Number(data.Item.BidHistory[k].Bid).toFixed(2) + "</div>";
		}
	}
	sPage += "<br>";
	return sPage;
}

function UUIDToLastFirst(sUUID) {
	for (var i=0; i<GlobalX.data.Users.length; i++) {
		if (GlobalX.data.Users[i].UUID === sUUID)
			return GlobalX.data.Users[i].Last + ", " + GlobalX.data.Users[i].First;
	}
}

function AddItemToWatchList(sItem) {
	alertify.confirm("Are you sure you want to add this item to your watch list?", function (e) {
    if (e) { //after clicking OK
			if (document.getElementById(sItem+'awl'))
				document.getElementById(sItem+'awl').style.display = 'none';
			var objAddItem = {};
			objAddItem.sItem = sItem;
			objAddItem.sUUID = GlobalX.UUID;
			objAddItem.sAuctionID = GlobalX.AuctionID;
			var sAddItem = JSON.stringify(objAddItem);
			$.post("Auction.php", {
				AddItemToWatch: sAddItem,
				},
				function(data, status) {
				if (data)
					GlobalX.data = data;
					for (var i=0; i<GlobalX.data.Users.length; i++) {
						if (GlobalX.UUID === GlobalX.data.Users[i].UUID) {
							GlobalX.First = GlobalX.data.Users[i].First;
							GlobalX.Admin = GlobalX.data.Users[i].Admin;
							GlobalX.WatchList = GlobalX.data.Users[i].WatchList;
							GlobalX.nWatchListCount = '' + GlobalX.WatchList.length;
							GlobalX.aWatchList = [];
							for (var j=0; j<GlobalX.nWatchListCount; j++) {
								GlobalX.aWatchList[j] = {};
								GlobalX.aWatchList[j].Item = {};
								GlobalX.aWatchList[j].Item.UUID = GlobalX.WatchList[j];
							}
							LoadWatchListData();
							i = GlobalX.data.Users.length + 1;  // Stop the looping
						}
					}
					MakeMenuPage();
				}, "json");
    } else {  //after clicking Cancel
    }
	});
}

function ItemUUIDToIndex(sItem) {
	var nLen =  GlobalX.aItems.length + '';
	nLen = Number(nLen);
	for (var i=0; i<nLen; i++) {
		if (sItem === GlobalX.aItems[i].substring(0, 6))
			return i;
	}
}

function MakeItemDetailUpdate(objItemData) {
	var sItem = '';
	var bYou = false;
	if (!objItemData.Item.BidHistory.length) {
			sItem += "<span style='color: green;'>Starting bid: $" + Number(objItemData.Item.StartingPrice).toFixed(2) + "</span><br>";
			sItem += "<a id='" + objItemData.Item.UUID + "fb' href='javascript:SubmitBid(\""+objItemData.Item.UUID+"\", \""+objItemData.Item.StartingPrice+"\")'>Bid $" + objItemData.Item.StartingPrice + " - </a>";
	}
	else {
		var nNextLowBid = Number(objItemData.Item.BidHistory[objItemData.Item.BidHistory.length-1].Bid) + Number(objItemData.Item.BidSteps);
		if (objItemData.Item.BidHistory[objItemData.Item.BidHistory.length-1].User === GlobalX.UUID)
			bYou = true;
		if (bYou)
			sItem += "Current bid: $" + Number(objItemData.Item.BidHistory[objItemData.Item.BidHistory.length-1].Bid).toFixed(2) + " (you)";
		else
			sItem += "<span style='color: red;'>Current bid: $" + Number(objItemData.Item.BidHistory[objItemData.Item.BidHistory.length-1].Bid).toFixed(2) + "</span>";
		if (Number(objItemData.Item.Reserve) > Number(objItemData.Item.BidHistory[objItemData.Item.BidHistory.length-1].Bid))
			sItem += " - <span style='color: red;'>reserve not met</span>";
		sItem += "<br>";
		sItem += "<a id='" + objItemData.Item.UUID + "fb' href='javascript:SubmitBid(\""+objItemData.Item.UUID+"\", \""+nNextLowBid+"\")'>Bid $" + Number(nNextLowBid).toFixed(2) + " - </a>";
	}
	sItem += "<a href='javascript:ShowCustBidBox(\""+objItemData.Item.UUID+"\", false)'>Custom Bid - </a>";
	sItem += "<a href='javascript:ShowCustBidBox(\""+objItemData.Item.UUID+"\", true)'>Set Max Bid</a>";
	return sItem;
}

function RefreshItemDetail(sItem) {
	document.getElementById(sItem+'r').style.display = 'none';
	setTimeout(function(){if (document.getElementById(sItem+'r')) document.getElementById(sItem+'r').style.display = 'block';}, 30000);
	$.post("Data/" + GlobalX.AuctionID + "/Items/" + sItem + ".json", {
		Nada: '',
		},
		function(data, status){
			document.getElementById(data.Item.UUID+'u').innerHTML = MakeItemDetailUpdate(data);
		if (document.getElementById('AdminBidHist'))
			document.getElementById('AdminBidHist').innerHTML = MakeAdminBidHist(data);
	}, "json");
}

// Similar to RefreshItemDetail, only adds trash can
function RefreshItem(sItem) {
	document.getElementById(sItem+'r').style.display = 'none';
	setTimeout(function(){if (document.getElementById(sItem+'r')) document.getElementById(sItem+'r').style.display = 'block';}, 30000);
	$.post("Data/" + GlobalX.AuctionID + "/Items/" + sItem + ".json", {
		Nada: '',
		},
		function(data, status){
			for (var i=0; i<GlobalX.aWatchList.length; i++) {
				if (data.Item.UUID === GlobalX.aWatchList[i].Item.UUID) {
					GlobalX.aWatchList[i] = data;
					document.getElementById(data.Item.UUID+'u').innerHTML = MakeItemUpdateables(i);
				}
			}
	}, "json");
}

function MakeEditInfoPage() {
	var sPage = MakeMenuLink();
	var nIndex = -1;
	for (var i=0; i<GlobalX.data.Users.length; i++) {
		if (GlobalX.UUID === GlobalX.data.Users[i].UUID) {
			nIndex = i;
			i = GlobalX.data.Users.length + 1;  // Stop the looping
		}
	}
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Edit Info</p>";
	sPage += "<div class='WatchListClass'>";
	sPage += "<p style='text-align: center;'>Please keep us up to date...</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='First Name' id='AuctionFirstName' maxlength='25' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")' value='" + GlobalX.data.Users[nIndex].First + "'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='Last Name' id='AuctionLastName' maxlength='25' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")' value='" + GlobalX.data.Users[nIndex].Last + "'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='EMail' id='AuctionEMail' maxlength='50' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")' value='" + GlobalX.data.Users[nIndex].EMail + "'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='Mobile Phone' id='AuctionCel' maxlength='14' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")' value='" + GlobalX.data.Users[nIndex].Cel+ "'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='User Name' id='AuctionUsername' maxlength='25' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")' value='" + GlobalX.data.Users[nIndex].Username + "'></p>";
	sPage += "<div id='PasswordUpdate' class='PasswordBox' style='display: none;'>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='password' class='Controls' style='text-align: center;' placeholder='Old Password' id='AuctionOldPassword' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='password' class='Controls' style='text-align: center;' placeholder='New Password' id='AuctionNewPassword1' maxlength='50' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='password' class='Controls' style='text-align: center;' placeholder='Confirm New Password' id='AuctionNewPassword2' maxlength='50' OnInput='ChangeYourInfo(\""+nIndex+"\")' OnKeyUp='ChangeYourInfo(\""+nIndex+"\")' OnChange='ChangeYourInfo(\""+nIndex+"\")' OnPaste='ChangeYourInfo(\""+nIndex+"\")'></p>";
	sPage += "</div>";
	sPage += "<p id='Feedback' style='text-align: center; font-size: 70%;'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='button' id='SaveYourInfo' value='Save' class='Controls' disabled='true' OnClick='OnSaveYourInfo(\""+nIndex+"\")'></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<a id='ChangePasswordLink' style='font-size: 80%;' href='javascript:ShowPasswordBox(\""+nIndex+"\")'>Change Password</a></p>";
	sPage += "</div>"; // End of WatchListClass
	sPage += "<br><br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
}


function ShowPasswordBox(nIndex) {
	if (document.getElementById('PasswordUpdate').style.display === 'none') {
		document.getElementById('PasswordUpdate').style.display = 'block';
		document.getElementById('ChangePasswordLink').innerHTML = "Don't Change Password";
		document.getElementById('AuctionOldPassword').focus();
	}
	else {
		document.getElementById('PasswordUpdate').style.display = 'none';
		document.getElementById('ChangePasswordLink').innerHTML = "Change Password";
	}
	ChangeYourInfo(nIndex);
}

function OnSaveYourInfo(nIndex) {
	var objUpdateUser = {};
	objUpdateUser.sUUID = GlobalX.UUID;
	objUpdateUser.sAuctionID = GlobalX.AuctionID;
	objUpdateUser.First = GlobalX.First = GlobalX.data.Users[nIndex].First = document.getElementById('AuctionFirstName').value.trim();
	objUpdateUser.Last = GlobalX.data.Users[nIndex].Last = document.getElementById('AuctionLastName').value.trim();
	objUpdateUser.EMail = GlobalX.data.Users[nIndex].EMail = document.getElementById('AuctionEMail').value.trim();
	objUpdateUser.Cel = GlobalX.data.Users[nIndex].Cel = FormatCelNumber(document.getElementById('AuctionCel').value.trim());
	objUpdateUser.Username = GlobalX.data.Users[nIndex].Username = document.getElementById('AuctionUsername').value.trim();
	if (document.getElementById('PasswordUpdate').style.display === 'block')
		objUpdateUser.Password = GlobalX.data.Users[nIndex].Password = document.getElementById('AuctionNewPassword1').value.trim();
	else
		objUpdateUser.Password = GlobalX.data.Users[nIndex].Password;
	var sUpdateUser = JSON.stringify(objUpdateUser);
	$.post("Auction.php", {
		UpdateUser: sUpdateUser,
		},
		function(data, status){
			if (data) {
				document.getElementById('SaveYourInfo').disabled = true;
				GlobalX.data = data;
				document.getElementById('Feedback').innerHTML = "Info Saved";
			}
	}, "json");
}

function ChangeYourInfo(nIndex) {
	document.getElementById('SaveYourInfo').disabled = true;
	var bPasswordChanging = false;
	var sFirst = document.getElementById('AuctionFirstName').value.trim();
	var sLast = document.getElementById('AuctionLastName').value.trim();
	var sEMail = document.getElementById('AuctionEMail').value.trim();
	var sCel = document.getElementById('AuctionCel').value.trim();
	var sUsername = document.getElementById('AuctionUsername').value.trim();
	var sOld = document.getElementById('AuctionOldPassword').value.trim();
	var sNew1 = document.getElementById('AuctionNewPassword1').value.trim();
	var sNew2 = document.getElementById('AuctionNewPassword2').value.trim();
	if (document.getElementById('PasswordUpdate').style.display === 'block')
		bPasswordChanging = true;
	var sFeedback = '';
	if (sFirst.length < 2)
		sFeedback = 'Enter your first name';
	else if (sLast.length < 2)
		sFeedback = 'Enter your last name';
	else if (!IsEMailAddressValid(sEMail))
		sFeedback = 'Enter your email address';
	else if (!IsEMailAddressUnique(sEMail, nIndex))
		sFeedback = 'That email address is already in use';
	else if (sCel.length < 10)
			sFeedback = 'Enter your cel number';
	else if (!IsCelNumberValid(sCel))
			sFeedback = 'Enter your cel number';
	else if (sUsername.length < 6)
			sFeedback = 'User Name must be at least 6 characters';
	else if (!IsUserNameUnique(sUsername, nIndex))
		sFeedback = 'User Name is already in use';
	else if (sOld !== GlobalX.data.Users[nIndex].Password && bPasswordChanging)
		sFeedback = 'Please enter your old password';
	else if (sNew1.length < 8 && bPasswordChanging)
		sFeedback = 'New password must be at least eight characters';
	else if (sOld === sNew1 && bPasswordChanging)
		sFeedback = 'Old and new passwords cannot be the same';
	else if (sNew1 !== sNew2 && bPasswordChanging)
		sFeedback = 'New password and confirmation do not match';
	else {
		document.getElementById('SaveYourInfo').disabled = false;
		sFeedback = '';
	}
	document.getElementById('Feedback').innerHTML = sFeedback;
}

function IsCelNumberValid(sCel) {
	var FormatedCelNumber = FormatCelNumber(sCel);
	document.getElementById('Feedback').innerHTML = FormatedCelNumber;
	if (FormatedCelNumber.length < 12)
		return false;
	else
		return true;
}

function FormatCelNumber(sCel) {
	if ('1' === sCel[0]) sCel = sCel.substring(1);
	var sCleanedNumber = '';
	for (var i=0; i<sCel.length; i++) {
		if (isNumeric(sCel[i])) {
			sCleanedNumber += sCel[i];
		}
	}
	return sCleanedNumber.substring(0, 3) + '.' + sCleanedNumber.substring(3, 6) + '.' + sCleanedNumber.substring(6);
}

function IsUserNameUnique(sUserName, nIndex) {
	if (-1 != nIndex && sUserName.toUpperCase() === GlobalX.data.Users[nIndex].Username.toUpperCase())
		return true;
	for (var i=0; i < GlobalX.data.Users.length; i++) {
		if (GlobalX.data.Users[i].Username.toUpperCase() === sUserName.toUpperCase())
			return false;
	}
	return true;
}

function IsEMailAddressUnique(sEMail, nIndex) {
	if (-1 != nIndex && sEMail.toUpperCase() === GlobalX.data.Users[nIndex].EMail.toUpperCase())
		return true;
	for (var i=0; i < GlobalX.data.Users.length; i++) {
		if (GlobalX.data.Users[i].EMail.toUpperCase() === sEMail.toUpperCase())
			return false;
	}
	return true;
}

function MakeAdminToolsPage() {
	var sPage = MakeMenuLink();
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Admin Tools</p>";
	sPage += "<p class='MenuItem'>";
	sPage += "<a href='javascript:MakeAddItemPage(-1)'>Add Item</a></p>";
	sPage += "<p class='MenuItem'>";
	sPage += "<a href='javascript:MakeEditItemPage()'>Edit Item</a></p>";
	sPage += "<p class='MenuItem'>";
	sPage += "<a href='javascript:MakeEditAuctionPage()'>Edit Auction</a></p>";
	sPage += "<br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
}

function MakeEditItemDetailPage(sID) {
	// alertify.alert("Function not yet implemented");
	$.post("Data/" + GlobalX.AuctionID + "/Items/" + sID + ".json", {
		Auction: '',
		},
		function(data, status) {
			MakeAddItemPage(data.Item.UUID);
			document.getElementById('Welcome').innerHTML = 'Edit Item';
			document.getElementById('ItemName').value = data.Item.Name;
			document.getElementById('ItemValue').value = data.Item.Value;
			document.getElementById('ItemStartingPrice').value = data.Item.StartingPrice;
			document.getElementById('ItemReserve').value = data.Item.Reserve;
			document.getElementById('BidIncrements').value = data.Item.BidSteps;
			document.getElementById('ItemShortDescription').value = data.Item.ShortDescription;
			document.getElementById('ItemDescription').value = data.Item.Description;
			document.getElementById('HideItem').checked = !data.Item.Show;
			var dNow = new Date();
			var nTimeZoneOffsetInMinutes = dNow.getTimezoneOffset();
			var nTZStart = data.Item.Starts - (nTimeZoneOffsetInMinutes*60000);
			var dStart = new Date(nTZStart);
			var sStart = dStart.toISOString();
			sStart = sStart.substr(0, 19);
			document.getElementById('ItemStartDateTime').value = sStart;
			var nTZSEnd = data.Item.Ends - (nTimeZoneOffsetInMinutes*60000);
			var dEnd = new Date(nTZSEnd);
			var sEnd= dEnd.toISOString();
			sEnd = sEnd.substr(0, 19);
			document.getElementById('ItemEndDateTime').value = sEnd;
		}, "json");
}

function MakeAddItemPage(nIndex) {
	var sPage = MakeMenuLink();
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Add Item</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='Item Name' id='ItemName' maxlength='25' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")' value=''></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "$<input type='text' class='Controls' style='text-align: center;' placeholder='Retail Value' id='ItemValue' maxlength='9' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")' value=''></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "$<input type='text' class='Controls' style='text-align: center;' placeholder='Starting Price' id='ItemStartingPrice' maxlength='9' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")' value=''></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "$<input type='text' class='Controls' style='text-align: center;' placeholder='Reserve Price' id='ItemReserve' maxlength='9' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")' value=''></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "$<input type='text' class='Controls' style='text-align: center;' placeholder='Minimum Bid Increments' id='BidIncrements' maxlength='9' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")' value=''></p>";
	sPage += "<p style='text-align: center;'><input type='checkbox' id='HideItem' OnChange='ChangeItem(\""+nIndex+"\")'> Hide Item?</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='Short Description' id='ItemShortDescription' maxlength='50' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")' value=''></p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<textarea placeholder='Full Description' id='ItemDescription' style='width: 300px; height: 100px;' maxlength='500' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")'></textarea></p>";
	sPage += "<div class='BidBox' style='display: block;'>";
	var dNow = new Date();
	var nTimeZoneOffsetInMinutes = dNow.getTimezoneOffset();
	var nTZStart = GlobalX.data.Starts - (nTimeZoneOffsetInMinutes*60000);
	var dStart = new Date(nTZStart);
	var sStart = dStart.toISOString();
	sStart = sStart.substr(0, 19);
	sPage += "<p style='text-align: center;'>Bidding Start Date/Time</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='datetime-local' class='Controls' style='text-align: center;' title='Bidding Start Date/Time' id='ItemStartDateTime' value='" + sStart + "' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")'></p>";
	sPage += "</div><br>"; // Start date/time box
	sPage += "<div class='BidBox' style='display: block;'>";
	var nTZSEnd = GlobalX.data.Ends - (nTimeZoneOffsetInMinutes*60000);
	var dEnd = new Date(nTZSEnd);
	var sEnd= dEnd.toISOString();
	sEnd = sEnd.substr(0, 19);
	sPage += "<p style='text-align: center;'>Bidding End Date/Time</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='datetime-local' class='Controls' style='text-align: center;' title='Bidding End Date/Time' id='ItemEndDateTime' value='" + sEnd + "' OnInput='ChangeItem(\""+nIndex+"\")' OnKeyUp='ChangeItem(\""+nIndex+"\")' OnChange='ChangeItem(\""+nIndex+"\")' OnPaste='ChangeItem(\""+nIndex+"\")'></p>";
	sPage += "</div>"; // End date/time box
	sPage += "<p id='Feedback' style='text-align: center; font-size: 70%;'>Enter Item Name</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='button' id='SaveItem' value='Save' class='Controls' disabled='true' OnClick='OnSaveItem(\""+nIndex+"\")'> ";
	sPage += "<input type='button' id='Cancel' value='Cancel' class='Controls' OnClick='MakeAdminToolsPage()'></p>";
	sPage += "<br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
}

function ChangeItem() {
	document.getElementById('SaveItem').disabled = true;
	var sItemName = document.getElementById('ItemName').value.trim();
	var sItemShortDescription = document.getElementById('ItemShortDescription').value.trim();
	var sItemDescription = document.getElementById('ItemDescription').value.trim();
	var sItemValue = document.getElementById('ItemValue').value.trim();
	var sItemStartingPrice = document.getElementById('ItemStartingPrice').value.trim();
	var sBidIncrements = document.getElementById('BidIncrements').value.trim();
	var sItemReserve = document.getElementById('ItemReserve').value.trim();
	var bHidden = document.getElementById('HideItem').checked;

	var sFeedback = '';
	if (sItemName.length < 2)
		sFeedback = 'Enter item name';
	else if (!isNumeric(sItemValue))
		sFeedback = "Enter the item's retail value";
	else if (!isNumeric(sItemStartingPrice))
		sFeedback = "Enter the starting price";
	else if (!isNumeric(sItemReserve))
		sFeedback = "Enter the reserve price";
	else if (Number(sItemStartingPrice) > Number(sItemReserve))
		sFeedback = "The reserve price must be higher than or equal to the starting price";
	else if (!isNumeric(sBidIncrements))
		sFeedback = "Enter the minimum bidding increments";
	else if (sItemShortDescription.length < 2)
		sFeedback = 'Enter a short description';
	else if (sItemDescription.length < 6)
		sFeedback = 'Enter a full description';
	else {
		document.getElementById('SaveItem').disabled = false;
		sFeedback = '';
	}
	document.getElementById('Feedback').innerHTML = sFeedback;
}

function OnSaveItem(nIndex) {
	document.getElementById('SaveItem').disabled = true;
	var objItem = {};
	objItem.Name = document.getElementById('ItemName').value.trim();
	objItem.UUID = (-1 == nIndex) ? "" : nIndex;
	objItem.ShortDescription = document.getElementById('ItemShortDescription').value.trim();
	objItem.Description = document.getElementById('ItemDescription').value.trim();
	objItem.Value = Number(document.getElementById('ItemValue').value.trim()).toFixed(2);
	objItem.StartingPrice = Number(document.getElementById('ItemStartingPrice').value.trim()).toFixed(2);
	objItem.Reserve = Number(document.getElementById('ItemReserve').value.trim()).toFixed(2);
	objItem.BidSteps = Number(document.getElementById('BidIncrements').value.trim()).toFixed(2);
	var dNow = new Date();
	var nTimeZoneOffsetInMinutes = dNow.getTimezoneOffset();
	var sStart = document.getElementById('ItemStartDateTime').value;
	var dStart = new Date(sStart);
	objItem.Starts = dStart.valueOf() + (nTimeZoneOffsetInMinutes*60000);
	var sEnd = document.getElementById('ItemEndDateTime').value;
	var dEnd = new Date(sEnd);
	objItem.Ends = dEnd.valueOf() + (nTimeZoneOffsetInMinutes*60000);
	objItem.Message = '';
	objItem.Show = !document.getElementById('HideItem').checked;
	// objItem.New = (-1 == nIndex) ? true : false;
	objItem.sAuctionID = GlobalX.AuctionID;
	objItem.MaxBid = {};
	objItem.BidHistory = [];
	var objItemOBJ = {};
	objItemOBJ.Item = objItem;
	var sItem = JSON.stringify(objItemOBJ);
	$.post("Auction.php", {
		ItemToSave: sItem,
		},
		function(data, status) {
			if (data) {
				var sPage = MakeMenuLink();
				sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Item " + data.Item.UUID + " Saved</p>";
				sPage += "<p class='MenuItem'>";
				sPage += "<a href='javascript:MakeAdminToolsPage()'>Return to Admin Tools</a></p>";
				sPage += "<br><br>";
				sPage += MakeLogo(true);
				document.getElementById('PageContent').innerHTML = sPage;
				GetItemList();
			}
	}, "json");
}

function MakeEditAuctionPage() {
	var sPage = MakeMenuLink();
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Edit Auction</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='text' class='Controls' style='text-align: center;' placeholder='Name' id='AuctionName' maxlength='21' value=''></p>";
	sPage += "<div class='BidBox' style='display: block;'>";
	var dNow = new Date();
	var nTimeZoneOffsetInMinutes = dNow.getTimezoneOffset();
	var nTZStart = GlobalX.data.Starts - (nTimeZoneOffsetInMinutes*60000);
	var dStart = new Date(nTZStart);
	var sStart = dStart.toISOString();
	sStart = sStart.substr(0, 19);
	sPage += "<p style='text-align: center;'>Item Default Start Date/Time*</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='datetime-local' class='Controls' style='text-align: center;' title='Default Item Start Date/Time' id='ItemStartDateTime' value='" + sStart + "'></p>";
	sPage += "</div>"; // Start date/time box

	sPage += "<div class='BidBox' style='display: block;'>";
	var nTZSEnd = GlobalX.data.Ends - (nTimeZoneOffsetInMinutes*60000);
	var dEnd = new Date(nTZSEnd);
	var sEnd= dEnd.toISOString();
	sEnd = sEnd.substr(0, 19);
	sPage += "<p style='text-align: center;'>Item Default End Date/Time*</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='datetime-local' class='Controls' style='text-align: center;' title='Default Item End Date/Time' id='ItemEndDateTime' value='" + sEnd + "'></p>";
	sPage += "</div>"; // End date/time box

	sPage += "<p style='text-align: center; font-size: 80%;'>* only affects items you create going forward</p>";
	sPage += "<p style='text-align: center;'>Auction ID: "+GlobalX.AuctionID+"</p>";
	sPage += "<p style='text-align: center;'>Admin passcode: "+GlobalX.data.AdminPasscode+"</p>";
	sPage += "<p style='text-align: center;'>";
	sPage += "<input type='button' id='SaveAuctionInfo' value='Save' class='Controls' OnClick='OnSaveAuctionChanges()'>";
	sPage += "<input type='button' id='Cancel' value='Cancel' class='Controls' OnClick='MakeAdminToolsPage()'></p>";

	sPage += "<br><br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
	document.getElementById('AuctionName').value = GlobalX.data.Name;
}

function OnSaveAuctionChanges() {
	document.getElementById('SaveAuctionInfo').disabled = true;
	var objAuctionUpdate = {};
	objAuctionUpdate.sAuctionID = GlobalX.AuctionID;
	var dNow = new Date();
	var nTimeZoneOffsetInMinutes = dNow.getTimezoneOffset();
	var sStart = document.getElementById('ItemStartDateTime').value;
	var dStart = new Date(sStart);
	objAuctionUpdate.Starts = dStart.valueOf() + (nTimeZoneOffsetInMinutes*60000);
	var sEnd = document.getElementById('ItemEndDateTime').value;
	var dEnd = new Date(sEnd);
	objAuctionUpdate.Ends = dEnd.valueOf() + (nTimeZoneOffsetInMinutes*60000);
	objAuctionUpdate.Name = document.getElementById('AuctionName').value;
	var sAuctionUpdate = JSON.stringify(objAuctionUpdate);
	$.post("Auction.php", {
		AuctionUpdate: sAuctionUpdate,
		},
		function(data, status){
			if (data) {
				GlobalX.data = data;
				var sPage = MakeMenuLink();
				sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Auction Saved</p>";
				sPage += "<p class='MenuItem'>";
				sPage += "<a href='javascript:MakeAdminToolsPage()'>Return to Admin Tools</a></p>";
				sPage += "<br><br>";
				sPage += MakeLogo(true);
				document.getElementById('PageContent').innerHTML = sPage;
			}
	}, "json");
}

function MakeEditItemPage() {
	var sPage = MakeMenuLink();
	sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>Edit Item</p>";
	sPage += "<div class='WatchListClass'>";
	for (var i=0; i<GlobalX.aItems.length; i++) {
		if (GlobalX.aItems[i] != '.' && GlobalX.aItems[i] != '..') {
			sPage += "<a href='javascript:MakeEditItemDetailPage(\""+GlobalX.aItems[i].substring(0, 6)+"\")'>" + GlobalX.aItems[i].substring(0, 6) + "</a>";
			if (i < GlobalX.aItems.length-1) sPage += " - ";
		}
	}
	sPage += "</div>";
	sPage += "<p class='MenuItem'>";
	sPage += "<a href='javascript:MakeAdminToolsPage()'>Return to Admin Tools</a></p>";
	sPage += "<br><br>";
	sPage += MakeLogo(true);
	document.getElementById('PageContent').innerHTML = sPage;
}

function MakeAboutPage() {
	$.post("Terms.txt", {
		Auction: '',
		},
		function(data, status){
			var sTerms = data.replace(/\n/g, '<br>');
			var sPage = MakeMenuLink();
			sPage += "<p class='Headline' style='text-align: center;' id='Welcome'>About</p>";
			sPage += "<div class='CopyBox'>";
			sPage += "<p><b>Auctionification</b></p>";
			sPage += "<p style='text-align: left;'>"+sTerms+"</p><br>";
			sPage += "<p><b>Credits</b></p>";
			sPage += "<p style='text-align: left;'>- Icons by http://iconleak.com</p><br>";
			sPage += "</div>";
			sPage += "<p style='text-align: center;'>";
			sPage += "<input type='text' id='AdminPasscode' class='Controls' maxlength='6' style='text-align: center;' placeholder='Admin Passcode' value=''></p>";
			sPage += "<p style='text-align: center;'>";
			sPage += "<input type='button' id='SubmitAdminPasscode' value='Submit' class='Controls' OnClick='SubmitAdminPasscodeBtn()'></p>";
			sPage += "<br><br>";
			sPage += MakeLogo(true);
			document.getElementById('PageContent').innerHTML = sPage;
		}, "text");
}

function SubmitAdminPasscodeBtn() {
	var sPasscode = document.getElementById('AdminPasscode').value.trim();
	if (GlobalX.data.AdminPasscode === sPasscode) {
		var objMakeAdmin = {};
		objMakeAdmin.sUUID = GlobalX.UUID;
		objMakeAdmin.sAuctionID = GlobalX.AuctionID;
		var sMakeAdmin = JSON.stringify(objMakeAdmin);
		$.post("Auction.php", {
		MakeAdmin: sMakeAdmin,
		},
		function(data, status) {
			GlobalX.data = data;
			GlobalX.Admin = true;
			alertify.alert('You are now an administrator of this auction.');
			MakeMenuPage();
		}, "json");
	}
	else
		alertify.alert('Incorrect code');
}

// General useful functions

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function IsEMailAddressValid(sEMAddress) {
  if (sEMAddress.length > 4 && sEMAddress.search('@') > 0  && sEMAddress.indexOf('.') > 0 && sEMAddress.search('www.') === -1 && sEMAddress.search('http') === -1)
    return true;
  else
    return false;
}

function setCookie(c_name, value, exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays===null) ? '' : '; expires='+exdate.toUTCString());
  document.cookie=c_name + '=' + c_value;
}

function getCookie(c_name) {
  var i,x,y,ARRcookies = document.cookie.split(';');
  for (i=0;i<ARRcookies.length;i++)
  {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf('='));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf('=')+1);
    x=x.replace(/^\s+|\s+$/g,'');
    if (x===c_name)
      return unescape(y);
  }
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

