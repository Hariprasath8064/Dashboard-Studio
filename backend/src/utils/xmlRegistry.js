const { DOMParser } = require('@xmldom/xmldom');

// The FULL, uncut bes.xml from the original Excel AddIn
const BES_XML_CONTENT = `<?xml version="1.0" encoding="us-ascii"?>
<BES>

  <ComputerType>
    <computers text="Common Properties" imageindex="5" tag="Object">
      <computers text="IDs" imageindex="4" tag="Integer"></computers>
      <computers text="Names" imageindex="6" tag="String"></computers>
      <computers text="Hostnames" imageindex="6" tag="String"></computers>
      <computers text="Operating Systems" imageindex="6" tag="String"></computers>
      <computers text="IP Addresses" imageindex="6" tag="String"></computers>
      <computers text="Last Report Times" imageindex="7" tag="Time"></computers>
      <computers text="CPUs" imageindex="6" tag="String"></computers>
    </computers>

    <computers text="Extended Properties" imageindex="5" tag="Object">
      <computers text="Active Directory Paths" imageindex="6" tag="String"></computers>
      <computers text="Agent Types" imageindex="6" tag="String"></computers>
      <computers text="Agent Versions" imageindex="6" tag="String"></computers>
      <computers text="Database IDs" imageindex="4" tag="Integer"></computers>
      <computers text="Database Names" imageindex="6" tag="String"></computers>
      <computers text="Device Types" imageindex="6" tag="String"></computers>
      <computers text="License Types" imageindex="6" tag="String"></computers>
      <computers text="Link Hrefs" imageindex="6" tag="String"></computers>
      <computers text="Links" imageindex="6" tag="String"></computers>
      <computers text="Locked Flags" imageindex="0" tag="Boolean"></computers>
      <computers text="Management Extensions" imageindex="6" tag="String"></computers>
      <computers text="Relay Distances" imageindex="4" tag="Integer"></computers>
      <computers text="Relay Hostnames" imageindex="6" tag="String"></computers>
      <computers text="Relay Selection Methods" imageindex="6" tag="String"></computers>
      <computers text="Relay Servers" imageindex="6" tag="String"></computers>
      <computers text="Relevant Fixlet Counts" imageindex="4" tag="Integer"></computers>
      <computers text="Remediated Fixlet Counts" imageindex="4" tag="Integer"></computers>
      <computers text="Root Servers" imageindex="6" tag="String"></computers>

      <computers text="Action Results" imageindex="5" tag="Object">
        <computers text="Statuses" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="Administrators" imageindex="5" tag="Object">
        <computers text="Names" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="Client Settings" imageindex="5" tag="Object">
        <computers text="Names" imageindex="6" tag="String"></computers>
        <computers text="Values" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="Comments" imageindex="5" tag="Object">
        <computers text="Texts" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="BES Computer Groups" imageindex="5" tag="Object">
        <computers text="Names" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="Property Results" imageindex="5" tag="Object">
        <computers text="Values" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="Relevant Fixlets" imageindex="5" tag="Object">
        <computers text="Names" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="Remediated Fixlets" imageindex="5" tag="Object">
        <computers text="Names" imageindex="6" tag="String"></computers>
      </computers>
      <computers text="Subscribed Sites" imageindex="5" tag="Object">
        <computers text="Names" imageindex="6" tag="String"></computers>
      </computers>
    </computers>
  </ComputerType>
  
  <FixletType>
    <fixlets text="Common Properties" imageindex="5" tag="Object">
      <fixlets text="Applicable Computer Count" imageindex="4" tag="Integer"></fixlets>
      <fixlets text="Category" imageindex="6" tag="String"></fixlets>
      <fixlets text="Download Size" imageindex="4" tag="Integer"></fixlets>
      <fixlets text="ID" imageindex="4" tag="Integer"></fixlets>
      <fixlets text="Name" imageindex="6" tag="String"></fixlets>
      <fixlets text="Open Action Count" imageindex="4" tag="Integer"></fixlets>
      <fixlets text="Remediated" imageindex="4" tag="Integer"></fixlets>
      <fixlets text="Sites" imageindex="5" tag="Object">
        <fixlets text="Names" imageindex="6" tag="String"></fixlets>
      </fixlets>
      <fixlets text="Source ID" imageindex="6" tag="String"></fixlets>
      <fixlets text="Source Release Date" imageindex="2" tag="Date"></fixlets>
      <fixlets text="Source Severity" imageindex="6" tag="String"></fixlets>
      <fixlets text="Source" imageindex="6" tag="String"></fixlets>
    </fixlets>

    <fixlets text="Extended Properties" imageindex="5" tag="Object">
      <fixlets text="Bodies" imageindex="6" tag="String"></fixlets>
      <fixlets text="Components XMLs" imageindex="6" tag="String"></fixlets>
      <fixlets text="Display Categories" imageindex="6" tag="String"></fixlets>
      <fixlets text="Display Messages" imageindex="6" tag="String"></fixlets>
      <fixlets text="Display Names" imageindex="6" tag="String"></fixlets>
      <fixlets text="Display Source IDs" imageindex="6" tag="String"></fixlets>
      <fixlets text="Display Sources" imageindex="6" tag="String"></fixlets>
      <fixlets text="Display Source Severities" imageindex="6" tag="String"></fixlets>
      <fixlets text="Messages" imageindex="6" tag="String"></fixlets>
      <fixlets text="Modification Times" imageindex="7" tag="Time"></fixlets>
      <fixlets text="Parent Relevances" imageindex="6" tag="String"></fixlets>
      <fixlets text="Relevances" imageindex="6" tag="String"></fixlets>
      <fixlets text="Relevance Clauses" imageindex="6" tag="String"></fixlets>
      <fixlets text="Remediated Computer Counts" imageindex="4" tag="Integer"></fixlets>
      <fixlets text="Wizard Datas" imageindex="6" tag="String"></fixlets>
      <fixlets text="Wizard Names" imageindex="6" tag="String"></fixlets>

      <fixlets text="Actions" imageindex="5" tag="Object">
        <fixlets text="Content IDs" imageindex="6" tag="String"/>
        <fixlets text="Script Types" imageindex="6" tag="String"/>
      </fixlets>
      <fixlets text="Analysis Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Applicable Computers" imageindex="5" tag="Object">
        <fixlets text="Names" imageindex="6" tag="String"/>
      </fixlets>
      <fixlets text="Baseline Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Best Activations" imageindex="5" tag="Object">
        <fixlets text="Active Flags" imageindex="0" tag="Boolean"/>
        <fixlets text="Creation Times" imageindex="7" tag="Time"/>
        <fixlets text="Database IDs" imageindex="4" tag="Integer"/>
        <fixlets text="IDs" imageindex="4" tag="Integer"/>
        <fixlets text="Names of Issuers" imageindex="6" tag="String"/>
        <fixlets text="Modification Times" imageindex="7" tag="Time"/>
      </fixlets>
      <fixlets text="Charset" imageindex="6" tag="String"></fixlets>
      <fixlets text="Creation Time" imageindex="7" tag="Time"></fixlets>
      <fixlets text="Custom Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Custom Site Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="CVE ID List" imageindex="6" tag="String"></fixlets>
      <fixlets text="Digest File Name" imageindex="6" tag="String"></fixlets>
      <fixlets text="Fixlet Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Globally Visible Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Group Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Link Href" imageindex="6" tag="String"></fixlets>
      <fixlets text="Locally Visible Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Master Site Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Operator Site Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="SANS ID List" imageindex="6" tag="String"></fixlets>
      <fixlets text="Task Flag" imageindex="0" tag="Boolean"></fixlets>
      <fixlets text="Type" imageindex="6" tag="String"></fixlets>
      <fixlets text="Unlocked Computer Count" imageindex="4" tag="Integer"></fixlets>
      <fixlets text="Wizard Link" imageindex="6" tag="String"></fixlets>
    </fixlets>
  </FixletType>

 <ActionType>
    <actions text="Common Properties" imageindex="5" tag="Object">
      <actions text="IDs" imageindex="4" tag="Integer"></actions>
      <actions text="Issuers" imageindex="5" tag="Object">
        <actions text="Names" imageindex="6" tag="String"/>
      </actions>
      <actions text="Multiple Flags" imageindex="0" tag="Boolean"></actions>
      <actions text="Names" imageindex="6" tag="String"></actions>
      <actions text="States" imageindex="6" tag="String"></actions>
      <actions text="Times Issued" imageindex="7" tag="Time"></actions>
    </actions>

    <actions text="Extended Properties" imageindex="5" tag="Object">
        <actions text="Action Scripts" imageindex="6" tag="String"></actions>
        <actions text="Action Script Types" imageindex="6" tag="String"></actions>
        <actions text="Applicability Relevances" imageindex="6" tag="String"></actions>
        <actions text="Computer Group Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Constrain By Property Names" imageindex="6" tag="String"></actions>
        <actions text="Constrain By Property Relations" imageindex="6" tag="String"></actions>
        <actions text="Constrain By Property Values" imageindex="6" tag="String"></actions>
        <actions text="Custom Success Relevances" imageindex="6" tag="String"></actions>
        <actions text="Database Ids" imageindex="4" tag="Integer"></actions>
        <actions text="Database Names" imageindex="6" tag="String"></actions>
        <actions text="Date Range Ends" imageindex="2" tag="Date"></actions>
        <actions text="Date Range Starts" imageindex="2" tag="Date"></actions>
        <actions text="Day_Of_Week Constraints" imageindex="6" tag="String"></actions>
        <actions text="End Dates" imageindex="2" tag="Date"></actions>
        <actions text="End Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="End Times_Of_Day" imageindex="7" tag="Time Of Day"></actions>
        <actions text="Expiration Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Expiration Times" imageindex="7" tag="Time"></actions>
        <actions text="Group Member Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Hidden Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Link Hrefs" imageindex="6" tag="String"></actions>
        <actions text="Links" imageindex="6" tag="String"></actions>
        <actions text="Management Rights Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Message Action Button Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Message Allow Cancel Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Message Postpone Delays" imageindex="7" tag="Time Interval"></actions>
        <actions text="Message Texts" imageindex="6" tag="String"></actions>
        <actions text="Message Timeout Delays" imageindex="7" tag="Time Interval"></actions>
        <actions text="Message Titles" imageindex="6" tag="String"></actions>
        <actions text="Offer Categories" imageindex="6" tag="String"></actions>
        <actions text="Offer Description Htmls" imageindex="6" tag="String"></actions>
        <actions text="Offer Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Operator Site Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Postaction Allow Cancel Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Postaction Force Delays" imageindex="7" tag="Time Interval"></actions>
        <actions text="Postaction Message Texts" imageindex="6" tag="String"></actions>
        <actions text="Postaction Message Titles" imageindex="6" tag="String"></actions>
        <actions text="Postaction Postpone Delays" imageindex="7" tag="Time Interval"></actions>
        <actions text="Reapplication Intervals" imageindex="7" tag="Time Interval"></actions>
        <actions text="Reapplication Limits" imageindex="4" tag="Integer"></actions>
        <actions text="Reapply Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Require User Absences" imageindex="0" tag="Boolean"></actions>
        <actions text="Require User Presences" imageindex="0" tag="Boolean"></actions>
        <actions text="Restart Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Retry Delays" imageindex="7" tag="Time Interval"></actions>
        <actions text="Retry Limits" imageindex="4" tag="Integer"></actions>
        <actions text="Retry Wait For Reboot Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Running Message Texts" imageindex="6" tag="String"></actions>
        <actions text="Running Message Titles" imageindex="6" tag="String"></actions>
        <actions text="Secure Parameter Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Selected Groups Strings" imageindex="6" tag="String"></actions>
        <actions text="Settings Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Show Message Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Show Running Message Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Shutdown Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Single Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Source Relevances" imageindex="6" tag="String"></actions>
        <actions text="Start Dates" imageindex="2" tag="Date"></actions>
        <actions text="Start Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Start Times_Of_Day" imageindex="7" tag="Time Of Day"></actions>
        <actions text="Subscription Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Success On Custom Relevances" imageindex="0" tag="Boolean"></actions>
        <actions text="Success On Original Relevances" imageindex="0" tag="Boolean"></actions>
        <actions text="Success On Run To Completions" imageindex="0" tag="Boolean"></actions>
        <actions text="Targeted By Id Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Targeted By List Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Targeted By Property Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Targeted Lists" imageindex="6" tag="String"></actions>
        <actions text="Targeted Names" imageindex="6" tag="String"></actions>
        <actions text="Targeting Methods" imageindex="6" tag="String"></actions>
        <actions text="Targeting Relevances" imageindex="6" tag="String"></actions>
        <actions text="Temporal Distributions" imageindex="7" tag="Time Interval"></actions>
        <actions text="Time Range Ends" imageindex="7" tag="Time Of Day"></actions>
        <actions text="Time Range Starts" imageindex="7" tag="Time Of Day"></actions>
        <actions text="Times Stopped" imageindex="7" tag="Time"></actions>
        <actions text="Untargeted Flags" imageindex="0" tag="Boolean"></actions>
        <actions text="Urgent Flags" imageindex="0" tag="Boolean"></actions>

        <actions text="Action Dependencies" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Comments" imageindex="5" tag="Object">
          <actions text="Texts" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Domains" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Member Actions" imageindex="5" tag="Object">
          <actions text="IDs" imageindex="4" tag="Integer"/>
          <actions text="Names" imageindex="6" tag="String"/>
        </actions>
        <actions text="Middle Actions" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Mime Fields" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Parameters" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
          <actions text="Values" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Parent Groups" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Elements of Reported Computer Set" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Results" imageindex="5" tag="Object">
          <actions text="Statuses" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Source Fixlets" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Stoppers" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
        <actions text="Targeted Computers" imageindex="5" tag="Object">
          <actions text="Names" imageindex="6" tag="String"></actions>
        </actions>
    </actions>
  </ActionType>

  <SiteType>
    <sites text="Creation Date" imageindex="7" tag="Time"></sites>
    <sites text="Creators" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="Custom Site Flag" imageindex="0" tag="Boolean"></sites>
    <sites text="Description" imageindex="6" tag="String"></sites>
    <sites text="Display name" imageindex="6" tag="String"></sites>
    <sites text="Explicit Owners" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="Explicit Readers" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="Explicit Writers" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="External Site Flag" imageindex="0" tag="Boolean"></sites>
    <sites text="Fixlets" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="Globally Readable Flag" imageindex="0" tag="Boolean"></sites>
    <sites text="ID" imageindex="4" tag="Integer"></sites>
    <sites text="Master Site Flag" imageindex="0" tag="Boolean"></sites>
    <sites text="Name" imageindex="6" tag="String"></sites>
    <sites text="Operator Site Flag" imageindex="0" tag="Boolean"></sites>
    <sites text="Owners" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="Readers" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="Subscribed Computers" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
    <sites text="Writers" imageindex="5" tag="Object">
      <sites text="Names" imageindex="6" tag="String"/>
    </sites>
  </SiteType>

  <CustomSiteType>
    <custom_sites text="Creation Date" imageindex="7" tag="Time"></custom_sites>
    <custom_sites text="Creators" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="Custom Site Flag" imageindex="0" tag="Boolean"></custom_sites>
    <custom_sites text="Description" imageindex="6" tag="String"></custom_sites>
    <custom_sites text="Display name" imageindex="6" tag="String"></custom_sites>
    <custom_sites text="Explicit Owners" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="Explicit Readers" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="Explicit Writers" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="External Site Flag" imageindex="0" tag="Boolean"></custom_sites>
    <custom_sites text="Fixlets" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="Globally Readable Flag" imageindex="0" tag="Boolean"></custom_sites>
    <custom_sites text="ID" imageindex="4" tag="Integer"></custom_sites>
    <custom_sites text="Master Site Flag" imageindex="0" tag="Boolean"></custom_sites>
    <custom_sites text="Name" imageindex="6" tag="String"></custom_sites>
    <custom_sites text="Operator Site Flag" imageindex="0" tag="Boolean"></custom_sites>
    <custom_sites text="Owners" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="Readers" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="Subscribed Computers" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
    <custom_sites text="Writers" imageindex="5" tag="Object">
      <custom_sites text="Names" imageindex="6" tag="String"/>
    </custom_sites>
  </CustomSiteType>

  <ComputerGroupType>
    <computer_groups text="Automatic Flag" imageindex="0" tag="Boolean"></computer_groups>
    <computer_groups text="Client Evaluated Flag" imageindex="0" tag="Boolean"></computer_groups>
    <computer_groups text="Database Id" imageindex="4" tag="Integer"></computer_groups>
    <computer_groups text="ID" imageindex="4" tag="Integer"></computer_groups>
    <computer_groups text="Manual Flag" imageindex="0" tag="Boolean"></computer_groups>
    <computer_groups text="Members" imageindex="5" tag="Object">
      <computer_groups text="Names" imageindex="6" tag="String"/>
    </computer_groups>
    <computer_groups text="Name" imageindex="6" tag="String"></computer_groups>
    <computer_groups text="Sites" imageindex="5" tag="Object">
      <computer_groups text="Names" imageindex="6" tag="String"/>
    </computer_groups>
  </ComputerGroupType>

  <UserType>
    <users text="Administered Computers" imageindex="5" tag="Object">
      <users text="Names" imageindex="6" tag="String"/>
    </users>
    <users text="Creation Time" imageindex="7" tag="Time"></users>
    <users text="Custom Content Flag" imageindex="0" tag="Boolean"></users>
    <users text="Issued Actions" imageindex="5" tag="Object">
      <users text="Names" imageindex="6" tag="String"/>
    </users>
    <users text="Last Login Time" imageindex="7" tag="Time"></users>
    <users text="Link Href" imageindex="6" tag="String"></users>
    <users text="Master Flag" imageindex="0" tag="Boolean"></users>
    <users text="Name" imageindex="6" tag="String"></users>
    <users text="Unmanagedasset Privilege Scanpoint Flag" imageindex="0" tag="Boolean"></users>
    <users text="Unmanagedasset Privilege Showall Flag" imageindex="0" tag="Boolean"></users>
    <users text="Unmanagedasset Privilege Shownone Flag" imageindex="0" tag="Boolean"></users>
    
    <users text="Action Site" imageindex="5" tag="Object">
      <users text="Name" imageindex="6" tag="String"/>
    </users>
    <users text="Approver Roles" imageindex="5" tag="Object">
      <users text="Names" imageindex="6" tag="String"/>
    </users>
    <users text="Distinguished Name" imageindex="6" tag="String"></users>
    <users text="ID" imageindex="4" tag="Integer"></users>
    <users text="Issued Computer Groups" imageindex="5" tag="Object">
      <users text="Names" imageindex="6" tag="String"/>
    </users>
    <users text="Issued Fixlets" imageindex="5" tag="Object">
      <users text="Names" imageindex="6" tag="String"/>
    </users>
    <users text="Ldap Directories" imageindex="5" tag="Object">
      <users text="Names" imageindex="6" tag="String"/>
    </users>
    <users text="Masthead Operator Name" imageindex="6" tag="String"></users>
    <users text="Operator Site" imageindex="5" tag="Object">
      <users text="Name" imageindex="6" tag="String"/>
    </users>
    <users text="Roles" imageindex="5" tag="Object">
      <users text="Names" imageindex="6" tag="String"/>
    </users>
    <users text="Show Other Action Flag" imageindex="0" tag="Boolean"></users>
    <users text="Stop Other Actions Flag" imageindex="0" tag="Boolean"></users>
  </UserType>

  <UnmanagedAssetType>
    <unmanagedassets text="Client Installed Flag" imageindex="0" tag="Boolean"></unmanagedassets>
    <unmanagedassets text="Fields" imageindex="5" tag="Object">
      <unmanagedassets text="Names" imageindex="6" tag="String"/>
      <unmanagedassets text="Values" imageindex="6" tag="String"/>
    </unmanagedassets>
    <unmanagedassets text="ID" imageindex="4" tag="Integer"></unmanagedassets>
    <unmanagedassets text="Link Href" imageindex="6" tag="String"></unmanagedassets>
    <unmanagedassets text="Source" imageindex="6" tag="String"></unmanagedassets>
  </UnmanagedAssetType>

  <FixletResultType>
    <results_of_bes_fixlets text="Computer" imageindex="5" tag="SearchableObject">
      <results_of_bes_fixlets text="Name" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Operating System" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="IP Addresses" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Last Report Time" imageindex="7" tag="Time"></results_of_bes_fixlets>
    </results_of_bes_fixlets>
    <results_of_bes_fixlets text="Fixlet" imageindex="5" tag="SearchableObject">
      <results_of_bes_fixlets text="Analysis Flag" imageindex="0" tag="Boolean"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Applicable Computer Count" imageindex="4" tag="Integer"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Category" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Download Size" imageindex="4" tag="Integer"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Fixlet Flag" imageindex="0" tag="Boolean"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="ID" imageindex="4" tag="Integer"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Name" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Name of Site" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Open Action Count" imageindex="4" tag="Integer"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Source" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Source ID" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Source Release Date" imageindex="2" tag="Date"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Source Severity" imageindex="6" tag="String"></results_of_bes_fixlets>
      <results_of_bes_fixlets text="Task Flag" imageindex="0" tag="Boolean"></results_of_bes_fixlets>
    </results_of_bes_fixlets>
    <results_of_bes_fixlets text="First Became Relevant" imageindex="7" tag="Time"></results_of_bes_fixlets>
    <results_of_bes_fixlets text="Last Became Nonrelevant" imageindex="7" tag="Time"></results_of_bes_fixlets>
    <results_of_bes_fixlets text="Last Became Relevant" imageindex="7" tag="Time"></results_of_bes_fixlets>
    <results_of_bes_fixlets text="Relevant Flag" imageindex="0" tag="Boolean"></results_of_bes_fixlets>
  </FixletResultType>

  <ActionResultType>
    <results_of_bes_actions text="Action" imageindex="5" tag="SearchableObject">
      <results_of_bes_actions text="ID" imageindex="4" tag="Integer"></results_of_bes_actions>
      <results_of_bes_actions text="Name of Issuer" imageindex="6" tag="String"></results_of_bes_actions>
      <results_of_bes_actions text="Multiple Flag" imageindex="0" tag="Boolean"></results_of_bes_actions>
      <results_of_bes_actions text="Name" imageindex="6" tag="String"></results_of_bes_actions>
      <results_of_bes_actions text="State" imageindex="6" tag="String"></results_of_bes_actions>
      <results_of_bes_actions text="Time Issued" imageindex="7" tag="Time"></results_of_bes_actions>
    </results_of_bes_actions>
    <results_of_bes_actions text="Apply Count" imageindex="4" tag="Integer"></results_of_bes_actions>
    <results_of_bes_actions text="Computer" imageindex="5" tag="Object">
      <results_of_bes_actions text="Name" imageindex="6" tag="String"></results_of_bes_actions>
      <results_of_bes_actions text="Operating System" imageindex="6" tag="String"></results_of_bes_actions>
      <results_of_bes_actions text="IP Addresses" imageindex="6" tag="String"></results_of_bes_actions>
      <results_of_bes_actions text="Last Report Time" imageindex="7" tag="Time"></results_of_bes_actions>
    </results_of_bes_actions>
    <results_of_bes_actions text="Detailed Status" imageindex="6" tag="String"></results_of_bes_actions>
    <results_of_bes_actions text="Line Number" imageindex="4" tag="Integer"></results_of_bes_actions>
    <results_of_bes_actions text="Retry Count" imageindex="4" tag="Integer"></results_of_bes_actions>
    <results_of_bes_actions text="Status" imageindex="6" tag="String"></results_of_bes_actions>
  </ActionResultType>
</BES>`;

class XMLRegistry {
  constructor() {
    const parser = new DOMParser();
    this.xmlDoc = parser.parseFromString(BES_XML_CONTENT, "text/xml");
  }

  getMappings() {
    return {
      'BES Computers': { tag: 'ComputerType', plural: 'bes computers', itemTag: 'computers' }, // <-- NEW!
      'BES Fixlets': { tag: 'FixletType', plural: 'bes fixlets', itemTag: 'fixlets' },
      'BES Actions': { tag: 'ActionType', plural: 'bes actions', itemTag: 'actions' },
      'BES Sites': { tag: 'SiteType', plural: 'bes sites', itemTag: 'sites' },
      'BES Custom Sites': { tag: 'CustomSiteType', plural: 'bes custom sites', itemTag: 'custom_sites' },
      'BES Computer Groups': { tag: 'ComputerGroupType', plural: 'bes computer groups', itemTag: 'computer_groups' },
      'BES Users': { tag: 'UserType', plural: 'bes users', itemTag: 'users' },
      'BES Unmanaged Assets': { tag: 'UnmanagedAssetType', plural: 'bes unmanaged assets', itemTag: 'unmanagedassets' },
      'BES Fixlet Results': { tag: 'FixletResultType', plural: 'results of bes fixlets', itemTag: 'results_of_bes_fixlets' },
      'BES Action Results': { tag: 'ActionResultType', plural: 'results of bes actions', itemTag: 'results_of_bes_actions' }
    };
  }

  getAvailableObjects() {
    return Object.keys(this.getMappings());
  }

  getPluralName(objectType) {
    if (objectType === 'BES Computers') return 'bes computers';
    const map = this.getMappings()[objectType];
    return map ? map.plural : objectType.toLowerCase();
  }

  getPropertiesFor(objectType) {
    const map = this.getMappings()[objectType];
    if (!map) return [];

    let rootNode;
    for (let i = 0; i < this.xmlDoc.documentElement.childNodes.length; i++) {
        const node = this.xmlDoc.documentElement.childNodes[i];
        if (node.tagName && node.tagName.toLowerCase() === map.tag.toLowerCase()) {
            rootNode = node;
            break;
        }
    }
    
    if (!rootNode) return [];

    const properties = [];

    const traverse = (node, currentPath, category) => {
      if (!node || !node.childNodes) return;
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        
        if (child.tagName && child.tagName.toLowerCase() === map.itemTag.toLowerCase()) {
          const text = child.getAttribute('text');
          if (!text) continue; 

          const type = child.getAttribute('tag') || 'String';
          const isCategory = text === 'Common Properties' || text === 'Extended Properties';

          let nextPath = currentPath;
          let currentCategory = category;

          if (isCategory) {
            currentCategory = text;
          } else {
            const relPiece = text.toLowerCase();
            nextPath = currentPath ? `${relPiece} of ${currentPath}` : relPiece;

            const displayName = currentPath ? `${text} of ${currentPath.replace(/\b\w/g, l => l.toUpperCase())}` : text;

            let hasChildren = false;
            for(let j=0; j < child.childNodes.length; j++) {
              if(child.childNodes[j].nodeType === 1) hasChildren = true; 
            }

            if (!hasChildren) {
              properties.push({
                name: displayName,                     
                relevancePath: nextPath,        
                type: currentCategory || 'Native',
                dataType: type                  
              });
            }
          }
          traverse(child, nextPath, currentCategory);
        }
      }
    };

    traverse(rootNode, "", "Native");
    return properties;
  }
}

const xmlRegistry = new XMLRegistry();

module.exports = { xmlRegistry };
