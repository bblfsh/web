Contributing
------------------------------

Contributions require sign-off. The sign-off is a simple line at the end  of the commit message for the patch or pull request, which certifies that you wrote it or otherwise have the right to pass it on as an open-source patch. The rules are pretty simple: if you can certify the below:

    Developer’s Certificate of Origin
    =================================

    By making a contribution to this project, I certify that:

      (a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or

      (b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or

      (c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.

      (d) I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

      (e) I agree to the following terms and conditions:

        (1) Except for the license granted herein to the maintainer and recipients of software distributed by the maintainer, You reserve all right, title, and interest in and to your contributions.

        (2) Grant of Copyright License. Subject to the terms and conditions of this Agreement, You hereby grant to the maintainer and to recipients of software distributed by the maintainer a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare derivative works of, publicly display, publicly perform, sublicense, and distribute your contributions and such derivative works.

        (3) Grant of Patent License. Subject to the terms and conditions of this Agreement, You hereby grant to the maintainer and to recipients of software distributed by the maintainer a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by You that are necessarily infringed by your contribution(s) alone or by combination of your contribution(s) with the Work to which such contribution(s) was submitted. If any entity institutes patent litigation against You or any other entity (including a cross-claim or counterclaim in a lawsuit) alleging that your contribution, or the Work to which you have contributed, constitutes direct or contributory patent infringement, then any patent licenses granted to that entity under this Agreement for that contribution or Work shall terminate as of the date such litigation is filed.

        (4) You are not expected to provide support for your contributions, except to the extent You desire to provide support. You may provide support for free, for a fee, or not at all. Unless required by applicable law or agreed to in writing, You provide your Contributions on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE.

then you just add a line saying

    Signed-off-by: Random J Developer <random@developer.example.org>

When committing using the command line you can sign off using the --signoff or -s flag. This adds a Signed-off-by line by the committer at the end of the commit log message.

    git commit -s -m "Commit message"
