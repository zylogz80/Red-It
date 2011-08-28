/*
    Red It: A beautiful and functional Reddit browser for webOS tablets 
    Copyright (C) 2011  Adam R. Drew adam@linkedlistcorruption.com

	This file is part of Red It.

    Red It is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
enyo.kind({

	kind: enyo.Service, 
	name: "readit.MarkdownConverter", 
	published: {


	},
	
	convertToText: function(inText) {
		//Convert input Reddit markup to plain text
		
		var outText = "";
		
		
		
		return outText;
		
	},
	
	convertToHTML: function(inText) {
		//Convert input Reddit markup  to HTML
		
		var outHTML = "";
		
		this.parseLinks(inText);
		
		outHTML = this.parseLinks(inText);
		
		return outHTML;
		
	},

	parseLinks: function(inText) {
		while ( inText.indexOf("](") != -1 ) {
			//Keep iterating as long as we find links

			var indexOfLinkJoint = inText.indexOf("](");
			var indexOfLinkTitleStart = indexOfLinkJoint;
			var indexOfLinkTitleEnd = indexOfLinkJoint;
			var indexOfLinkAddyStart = indexOfLinkJoint + 2;
			var indexOfLinkAddyEnd = indexOfLinkJoint;
			
			while ( inText.charAt(indexOfLinkTitleStart) != "[" ) {
				
				indexOfLinkTitleStart--;
				
			}

			indexOfLinkTitleStart++;

			while ( inText.charAt(indexOfLinkAddyEnd) != ")" ) {
				
				indexOfLinkAddyEnd++;
				
			}			
	
			var linkTitle = inText.slice(indexOfLinkTitleStart,indexOfLinkTitleEnd);
			var linkAddy = inText.slice(indexOfLinkAddyStart, indexOfLinkAddyEnd);
			
			var linkHTML = "<a href='"+linkAddy+"'>"+linkTitle+"</a>";
			
			var beforeLink = inText.substr(0, indexOfLinkTitleStart - 1);
			var afterLink = inText.substr(indexOfLinkAddyEnd + 1);
			
			var result = beforeLink + " " + linkHTML + " " + afterLink;
			
			inText = result;
		};
		return inText;
	}

	
})
