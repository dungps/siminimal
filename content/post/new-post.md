---data
title: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
author: dungps
---


###Install RVM
Open Terminal and run this command:

```bash
gpg --keyserver hkp://keys.gnupg.net --recv-keys D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --auto-dotfiles
```

After install run this command:

```bash
source ~/.rvm/scripts/rvm
```

To install packages for rvm dependency

```bash
rvm requirements
```

You can check rvm version with command

```bash
rvm -v
```

###Install Ruby
Run command:

```bash
rvm install ruby # will install lastest ruby version
rvm install 2.2 # will install ruby version 2.2

# if compile vim for support rvm ruby, compile ruby from source, don't
# use binary package
rvm install ruby --disable-binary
```

Set default ruby version:

```bash
rvm use 2.2 --default # with 2.2 is installed ruby version
```

You can check ruby version with command:

```bash
ruby -v
```

###Install Ruby on Rails
Run command:

```bash
gem install rails # will install lasest version of rails
gem install rails -v 4.2 # will install rails with version 4.2
```

After all gems installed, you can check rails version:

```bash
rails -v
```