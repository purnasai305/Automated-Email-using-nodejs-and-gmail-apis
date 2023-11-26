#Automated Email using Nodejs and gmail apis

VacationApp is a Node.js application that automates email replies using the Gmail API. It checks for new emails, sends replies to those without prior responses, and adds labels to organize the emails.

## Features

- **Gmail API Integration:** Utilizes the Gmail API to authenticate, fetch emails, and send replies.
- **Auto-Reply Mechanism:** Identifies email threads with no prior responses and sends automated replies.
- **Labeling and Organization:** Adds a custom label to emails and moves them for better organization.
- **Randomized Intervals:** Executes the sequence of actions at random intervals for a more natural behavior.

## Getting Started

Follow these steps to set up and run the VacationApp on your local machine.

### Prerequisites

- Node.js installed on your machine.
- Google Cloud project with Gmail API enabled.
- Gmail API credentials (client ID, client secret) stored securely.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/vacationapp.git
   cd vacationapp
